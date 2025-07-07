const TMDB_API_KEY = '829c297950e61e0c7178b5fd9c9e6fa0'; // You'll need to get this from https://www.themoviedb.org/settings/api
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
}

export interface TMDBSeries {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  number_of_seasons: number;
  number_of_episodes: number;
  genre_ids: number[];
  genres?: { id: number; name: string }[];
}

export interface TMDBSeason {
  season_number: number;
  episode_count: number;
  episodes: TMDBEpisode[];
}

export interface TMDBEpisode {
  episode_number: number;
  name: string;
  overview: string;
  runtime: number;
  season_number: number;
}

export interface MALAnime {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  year: number;
  score: number;
  genres: { name: string }[];
  type: string;
  episodes: number;
}

class TMDBService {
  private async fetchTMDB(endpoint: string) {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getMovie(tmdbId: number): Promise<TMDBMovie> {
    const movie = await this.fetchTMDB(`/movie/${tmdbId}`);
    return {
      ...movie,
      poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null
    };
  }

  async getSeries(tmdbId: number): Promise<TMDBSeries> {
    const series = await this.fetchTMDB(`/tv/${tmdbId}`);
    return {
      ...series,
      poster_path: series.poster_path ? `${IMAGE_BASE_URL}${series.poster_path}` : null
    };
  }

  async getSeasonEpisodes(tmdbId: number, seasonNumber: number): Promise<TMDBSeason> {
    const season = await this.fetchTMDB(`/tv/${tmdbId}/season/${seasonNumber}`);
    return season;
  }

  async getAllSeasons(tmdbId: number): Promise<TMDBEpisode[]> {
    const series = await this.getSeries(tmdbId);
    const allEpisodes: TMDBEpisode[] = [];

    for (let seasonNum = 1; seasonNum <= series.number_of_seasons; seasonNum++) {
      try {
        const season = await this.getSeasonEpisodes(tmdbId, seasonNum);
        if (season.episodes) {
          allEpisodes.push(...season.episodes);
        }
      } catch (error) {
        console.warn(`Failed to fetch season ${seasonNum} for series ${tmdbId}:`, error);
      }
    }

    return allEpisodes;
  }
}

class MALService {
  private async fetchMAL(endpoint: string) {
    const response = await fetch(`https://api.jikan.moe/v4${endpoint}`);
    if (!response.ok) {
      throw new Error(`MAL API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  }

  async getAnime(malId: number): Promise<MALAnime> {
    return this.fetchMAL(`/anime/${malId}`);
  }
}

export const tmdbService = new TMDBService();
export const malService = new MALService();

// Helper function to generate vidlink.pro URLs
export function generateVidlinkUrl(type: 'movie' | 'tv' | 'anime', id: number, season?: number, episode?: number, subOrDub?: 'sub' | 'dub'): string {
  switch (type) {
    case 'movie':
      return `https://vidlink.pro/movie/${id}`;
    case 'tv':
      return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    case 'anime':
      return `https://vidlink.pro/anime/${id}/${episode}/${subOrDub || 'sub'}`;
    default:
      throw new Error('Invalid content type');
  }
}

// Helper function to convert genre IDs to names
export function getGenreNames(genreIds: number[], type: 'movie' | 'tv'): string {
  const movieGenres: Record<number, string> = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
    27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  const tvGenres: Record<number, string> = {
    10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
    9648: 'Mystery', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
    10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
  };

  const genres = type === 'movie' ? movieGenres : tvGenres;
  const names = genreIds.map(id => genres[id]).filter(Boolean);
  return names.length > 0 ? names[0] : 'Unknown';
}