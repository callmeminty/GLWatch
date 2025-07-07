import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { sampleMovies, sampleSeries, sampleAnimes } from '../data/sampleContent';

export function useContentSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

  const seedContent = async () => {
    setIsSeeding(true);
    setSeedProgress(0);

    try {
      const allContent = [...sampleMovies, ...sampleSeries, ...sampleAnimes];
      const total = allContent.length;

      for (let i = 0; i < allContent.length; i++) {
        const content = allContent[i];
        
        // Check if content already exists
        const { data: existing } = await supabase
          .from('anime_content')
          .select('id')
          .eq('title', content.title)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('anime_content')
            .insert([content]);

          if (error) {
            console.error(`Error inserting ${content.title}:`, error);
          }
        }

        setSeedProgress(Math.round(((i + 1) / total) * 100));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Seed episodes for series
      await seedEpisodes();

    } catch (error) {
      console.error('Error seeding content:', error);
      throw error;
    } finally {
      setIsSeeding(false);
      setSeedProgress(0);
    }
  };

  const seedEpisodes = async () => {
    const seriesToSeed = [
      {
        title: "Wednesday",
        episodes: [
          { episode_number: 1, title: "Wednesday's Child Is Full of Woe", iframe_url: "https://vidlink.pro/tv/119051/1/1", duration: 51 },
          { episode_number: 2, title: "Woe Is the Loneliest Number", iframe_url: "https://vidlink.pro/tv/119051/1/2", duration: 47 },
          { episode_number: 3, title: "Friend or Woe", iframe_url: "https://vidlink.pro/tv/119051/1/3", duration: 50 },
          { episode_number: 4, title: "Woe What a Night", iframe_url: "https://vidlink.pro/tv/119051/1/4", duration: 49 },
          { episode_number: 5, title: "You Reap What You Woe", iframe_url: "https://vidlink.pro/tv/119051/1/5", duration: 45 },
          { episode_number: 6, title: "Quid Pro Woe", iframe_url: "https://vidlink.pro/tv/119051/1/6", duration: 50 },
          { episode_number: 7, title: "If You Don't Woe Me by Now", iframe_url: "https://vidlink.pro/tv/119051/1/7", duration: 52 },
          { episode_number: 8, title: "A Murder of Woes", iframe_url: "https://vidlink.pro/tv/119051/1/8", duration: 55 }
        ]
      },
      {
        title: "House of the Dragon",
        episodes: [
          { episode_number: 1, title: "The Heirs of the Dragon", iframe_url: "https://vidlink.pro/tv/94997/1/1", duration: 66 },
          { episode_number: 2, title: "The Rogue Prince", iframe_url: "https://vidlink.pro/tv/94997/1/2", duration: 54 },
          { episode_number: 3, title: "Second of His Name", iframe_url: "https://vidlink.pro/tv/94997/1/3", duration: 63 },
          { episode_number: 4, title: "King of the Narrow Sea", iframe_url: "https://vidlink.pro/tv/94997/1/4", duration: 62 },
          { episode_number: 5, title: "We Light the Way", iframe_url: "https://vidlink.pro/tv/94997/1/5", duration: 59 }
        ]
      },
      {
        title: "The Last of Us",
        episodes: [
          { episode_number: 1, title: "When You're Lost in the Darkness", iframe_url: "https://vidlink.pro/tv/100088/1/1", duration: 81 },
          { episode_number: 2, title: "Infected", iframe_url: "https://vidlink.pro/tv/100088/1/2", duration: 56 },
          { episode_number: 3, title: "Long, Long Time", iframe_url: "https://vidlink.pro/tv/100088/1/3", duration: 76 },
          { episode_number: 4, title: "Please Hold to My Hand", iframe_url: "https://vidlink.pro/tv/100088/1/4", duration: 45 },
          { episode_number: 5, title: "Endure and Survive", iframe_url: "https://vidlink.pro/tv/100088/1/5", duration: 56 }
        ]
      }
    ];

    for (const series of seriesToSeed) {
      // Get the anime_id for this series
      const { data: animeData } = await supabase
        .from('anime_content')
        .select('id')
        .eq('title', series.title)
        .single();

      if (animeData) {
        for (const episode of series.episodes) {
          // Check if episode already exists
          const { data: existingEpisode } = await supabase
            .from('episodes')
            .select('id')
            .eq('anime_id', animeData.id)
            .eq('episode_number', episode.episode_number)
            .single();

          if (!existingEpisode) {
            await supabase
              .from('episodes')
              .insert([{
                anime_id: animeData.id,
                ...episode
              }]);
          }
        }
      }
    }
  };

  const clearAllContent = async () => {
    try {
      // Delete all episodes first (due to foreign key constraint)
      await supabase.from('episodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Then delete all anime content
      await supabase.from('anime_content').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (error) {
      console.error('Error clearing content:', error);
      throw error;
    }
  };

  return {
    seedContent,
    clearAllContent,
    isSeeding,
    seedProgress
  };
}