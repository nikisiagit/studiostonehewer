import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260711_203454 from './20260711_203454';
import * as migration_20260712_064135 from './20260712_064135';
import * as migration_20260713_071558 from './20260713_071558';
import * as migration_20260713_092615 from './20260713_092615';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260711_203454.up,
    down: migration_20260711_203454.down,
    name: '20260711_203454',
  },
  {
    up: migration_20260712_064135.up,
    down: migration_20260712_064135.down,
    name: '20260712_064135',
  },
  {
    up: migration_20260713_071558.up,
    down: migration_20260713_071558.down,
    name: '20260713_071558',
  },
  {
    up: migration_20260713_092615.up,
    down: migration_20260713_092615.down,
    name: '20260713_092615'
  },
];
