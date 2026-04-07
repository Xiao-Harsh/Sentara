export const soundCategories = [
  {
    id: '1',
    name: "Calm",
    icon: 'leaf',
    gradient: ['#E1F5FE', '#B3E5FC'],
    songs: [
      { id: 'c1', title: "Soft Breeze", duration: "4:32", file: require('../../assets/music/calm_breeze.mp3') },
      { id: 'c2', title: "Inner Peace", duration: "5:10", file: require('../../assets/music/calm.mp3') },
    ]
  },
  {
    id: '2',
    name: "Forest",
    icon: 'tree',
    gradient: ['#E8F5E9', '#C8E6C9'],
    songs: [
      { id: 'f1', title: "Morning Dew", duration: "3:45", file: require('../../assets/music/morning_dew.mp3') },
      { id: 'f2', title: "Deep Woodland", duration: "6:12", file: require('../../assets/music/forest.mp3') },
    ]
  },
  {
    id: '3',
    name: "Rain",
    icon: 'cloud-rain',
    gradient: ['#F3E5F5', '#E1BEE7'],
    songs: [
      { id: 'r1', title: "Gentle Rain", duration: "5:20", file: require('../../assets/music/gentle_rain.mp3') },
      { id: 'r2', title: "Steady Downpour", duration: "7:45", file: require('../../assets/music/rain.mp3') },
    ]
  },
  {
    id: '4',
    name: "Ocean",
    icon: 'droplet',
    gradient: ['#E0F2F1', '#B2DFDB'],
    songs: [
      { id: 'o1', title: "Rolling Waves", duration: "4:55", file: require('../../assets/music/ocean_waves.mp3') },
      { id: 'o2', title: "Tide & Surf", duration: "8:30", file: require('../../assets/music/ocean.mp3') },
    ]
  },
  {
    id: '5',
    name: "Night",
    icon: 'moon',
    gradient: ['#FFF3E0', '#FFE0B2'],
    songs: [
      { id: 'n1', title: "Midnight Cricket", duration: "6:40", file: require('../../assets/music/night.mp3') },
      { id: 'n2', title: "Zen Moon", duration: "5:55", file: require('../../assets/music/zen_garden.mp3') },
    ]
  }
];
