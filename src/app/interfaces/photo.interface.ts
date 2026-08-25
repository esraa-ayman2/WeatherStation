export interface WeatherPhotoItem {
  id: string;
  title: string;
  photographer: string;
  location: string;
  category: 'Clouds' | 'Storm' | 'Sunset' | 'Snow' | 'Aurora';
  imageUrl: string;
  likes: number;
}
