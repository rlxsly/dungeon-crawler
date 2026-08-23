import { DungeonLevel, Room, Obstacle, RoomType, Weapon, Corridor } from '../types/game';
import { getRandomWeapon } from '../data/weapons';

export const ROOM_WIDTH = 760;
export const ROOM_HEIGHT = 560;
export const WALL_THICKNESS = 36;
export const DOOR_WIDTH = 140;
export const CORRIDOR_LENGTH = 180;

export function generateDungeonLevel(stage: number, floor: number): DungeonLevel {
  const gridWidth = 4;
  const gridHeight = 4;
  const grid: (Room | null)[][] = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => null)
  );

  // Biome and Boss determination for all 5 Stages
  const biomes: Record<number, 'ancient_ruins' | 'death_star' | 'valley_end' | 'northern_crater' | 'cairo_clocktower'> = {
    1: 'ancient_ruins',
    2: 'death_star',
    3: 'valley_end',
    4: 'northern_crater',
    5: 'cairo_clocktower',
  };
  const biome = biomes[stage] || 'ancient_ruins';

  const bossNames: Record<number, string> = {
    1: 'Ryomen Sukuna',
    2: 'Darth Vader',
    3: 'Madara Uchiha',
    4: 'Sephiroth',
    5: 'DIO (The World)',
  };
  const bossName = bossNames[stage] || 'Ryomen Sukuna';

  // Room layout creation using Random Walk / Spanning Tree
  const rooms: Room[] = [];
  const startX = 1 + Math.floor(Math.random() * 2);
  const startY = 1 + Math.floor(Math.random() * 2);

  const roomCoords: { x: number; y: number }[] = [{ x: startX, y: startY }];
  const targetRoomCount = 6 + Math.min(stage, 2);

  const directions = [
    { dx: 0, dy: -1 }, // top
    { dx: 0, dy: 1 },  // bottom
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 },  // right
  ];

  while (roomCoords.length < targetRoomCount) {
    const current = roomCoords[Math.floor(Math.random() * roomCoords.length)];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const nx = current.x + dir.dx;
    const ny = current.y + dir.dy;

    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
      if (!roomCoords.some((r) => r.x === nx && r.y === ny)) {
        roomCoords.push({ x: nx, y: ny });
      }
    }
  }

  // Assign Room Types
  const startCoord = roomCoords[0];
  let maxDist = -1;
  let endCoordIdx = roomCoords.length - 1;

  roomCoords.forEach((coord, idx) => {
    if (idx === 0) return;
    const dist = Math.abs(coord.x - startCoord.x) + Math.abs(coord.y - startCoord.y);
    if (dist > maxDist) {
      maxDist = dist;
      endCoordIdx = idx;
    }
  });

  // Assign types to coordinates: Boss spawns every 5 stages / floor 5
  const isBossFloor = floor === 5 || floor % 5 === 0;
  const typeAssignments: { [key: number]: RoomType } = {};
  typeAssignments[0] = 'start';
  typeAssignments[endCoordIdx] = isBossFloor ? 'boss' : 'combat';

  const otherIndices = roomCoords
    .map((_, i) => i)
    .filter((i) => i !== 0 && i !== endCoordIdx);

  // Shuffle other indices
  const shuffledOthers = [...otherIndices].sort(() => 0.5 - Math.random());

  if (shuffledOthers.length > 0) {
    typeAssignments[shuffledOthers[0]] = 'chest';
  }
  if (shuffledOthers.length > 1) {
    typeAssignments[shuffledOthers[1]] = 'shop';
  }
  if (shuffledOthers.length > 2) {
    typeAssignments[shuffledOthers[2]] = 'statue';
  }
  if (shuffledOthers.length > 3) {
    typeAssignments[shuffledOthers[3]] = 'upgrade';
  }

  const stepX = ROOM_WIDTH + CORRIDOR_LENGTH;
  const stepY = ROOM_HEIGHT + CORRIDOR_LENGTH;

  // Create room objects
  roomCoords.forEach((coord, idx) => {
    const type = typeAssignments[idx] || 'combat';
    const isEnd = idx === endCoordIdx;
    const worldX = coord.x * stepX;
    const worldY = coord.y * stepY;

    const room: Room = {
      id: `room_${coord.x}_${coord.y}`,
      gridX: coord.x,
      gridY: coord.y,
      worldX,
      worldY,
      width: ROOM_WIDTH,
      height: ROOM_HEIGHT,
      type,
      isEndRoom: isEnd,
      cleared: type === 'start' || type === 'chest' || type === 'shop' || type === 'statue' || type === 'upgrade',
      visited: idx === 0,
      doors: {},
      obstacles: [],
      enemiesSpawned: false,
    };

    grid[coord.y][coord.x] = room;
    rooms.push(room);
  });

  // Connect doors between adjacent rooms in grid
  rooms.forEach((room) => {
    const { gridX, gridY } = room;
    if (gridY > 0 && grid[gridY - 1][gridX]) room.doors.top = true;
    if (gridY < gridHeight - 1 && grid[gridY + 1][gridX]) room.doors.bottom = true;
    if (gridX > 0 && grid[gridY][gridX - 1]) room.doors.left = true;
    if (gridX < gridWidth - 1 && grid[gridY][gridX + 1]) room.doors.right = true;
  });

  // Generate Corridors / Hallways and their boundary walls
  const corridors: Corridor[] = [];
  const corridorObstacles: Obstacle[] = [];

  rooms.forEach((room) => {
    const { gridX, gridY, worldX, worldY, width, height } = room;
    const topH = (height - DOOR_WIDTH) / 2;
    const leftW = (width - DOOR_WIDTH) / 2;

    // Horizontal Corridor to the Right
    if (room.doors.right && gridX < gridWidth - 1 && grid[gridY][gridX + 1]) {
      const corrX = worldX + width;
      const corrY = worldY + topH;
      const corrW = CORRIDOR_LENGTH;
      const corrH = DOOR_WIDTH;

      corridors.push({
        id: `corr_h_${gridX}_${gridY}`,
        fromGridX: gridX,
        fromGridY: gridY,
        toGridX: gridX + 1,
        toGridY: gridY,
        direction: 'horizontal',
        x: corrX,
        y: corrY,
        width: corrW,
        height: corrH,
      });

      // Top boundary wall for hallway
      corridorObstacles.push({
        id: `corr_wall_top_${gridX}_${gridY}`,
        x: corrX - 2,
        y: corrY - WALL_THICKNESS,
        width: corrW + 4,
        height: WALL_THICKNESS,
        type: 'wall',
      });

      // Bottom boundary wall for hallway
      corridorObstacles.push({
        id: `corr_wall_bot_${gridX}_${gridY}`,
        x: corrX - 2,
        y: corrY + corrH,
        width: corrW + 4,
        height: WALL_THICKNESS,
        type: 'wall',
      });
    }

    // Vertical Corridor Downwards
    if (room.doors.bottom && gridY < gridHeight - 1 && grid[gridY + 1][gridX]) {
      const corrX = worldX + leftW;
      const corrY = worldY + height;
      const corrW = DOOR_WIDTH;
      const corrH = CORRIDOR_LENGTH;

      corridors.push({
        id: `corr_v_${gridX}_${gridY}`,
        fromGridX: gridX,
        fromGridY: gridY,
        toGridX: gridX,
        toGridY: gridY + 1,
        direction: 'vertical',
        x: corrX,
        y: corrY,
        width: corrW,
        height: corrH,
      });

      // Left boundary wall for hallway
      corridorObstacles.push({
        id: `corr_wall_left_${gridX}_${gridY}`,
        x: corrX - WALL_THICKNESS,
        y: corrY - 2,
        width: WALL_THICKNESS,
        height: corrH + 4,
        type: 'wall',
      });

      // Right boundary wall for hallway
      corridorObstacles.push({
        id: `corr_wall_right_${gridX}_${gridY}`,
        x: corrX + corrW,
        y: corrY - 2,
        width: WALL_THICKNESS,
        height: corrH + 4,
        type: 'wall',
      });
    }
  });

  // Generate Obstacles, Crates, Barrels, Statues, Chests, and Shop Items per room
  rooms.forEach((room) => {
    generateRoomContent(room, stage, floor, biome);
  });

  // Collect all obstacles across all rooms + corridor walls
  const allObstacles: Obstacle[] = [...corridorObstacles];
  rooms.forEach((r) => {
    allObstacles.push(...r.obstacles);
  });

  // Calculate Dungeon Bounding Box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rooms.forEach((r) => {
    minX = Math.min(minX, r.worldX);
    minY = Math.min(minY, r.worldY);
    maxX = Math.max(maxX, r.worldX + r.width);
    maxY = Math.max(maxY, r.worldY + r.height);
  });

  return {
    stage,
    floor,
    rooms,
    corridors,
    allObstacles,
    gridWidth,
    gridHeight,
    biome,
    bossName,
    bounds: { minX: minX - 100, minY: minY - 100, maxX: maxX + 100, maxY: maxY + 100 },
  };
}

function generateRoomContent(room: Room, stage: number, floor: number, biome: string) {
  const { worldX, worldY, width, height, type, doors } = room;
  const obstacles: Obstacle[] = [];
  const leftW = (width - DOOR_WIDTH) / 2;
  const topH = (height - DOOR_WIDTH) / 2;

  // Generate Perimeter Walls with Door Openings
  // TOP WALL
  if (doors.top) {
    obstacles.push({ id: `${room.id}_wall_t1`, x: worldX, y: worldY, width: leftW, height: WALL_THICKNESS, type: 'wall' });
    obstacles.push({ id: `${room.id}_wall_t2`, x: worldX + leftW + DOOR_WIDTH, y: worldY, width: leftW, height: WALL_THICKNESS, type: 'wall' });
  } else {
    obstacles.push({ id: `${room.id}_wall_t`, x: worldX, y: worldY, width, height: WALL_THICKNESS, type: 'wall' });
  }

  // BOTTOM WALL
  if (doors.bottom) {
    obstacles.push({ id: `${room.id}_wall_b1`, x: worldX, y: worldY + height - WALL_THICKNESS, width: leftW, height: WALL_THICKNESS, type: 'wall' });
    obstacles.push({ id: `${room.id}_wall_b2`, x: worldX + leftW + DOOR_WIDTH, y: worldY + height - WALL_THICKNESS, width: leftW, height: WALL_THICKNESS, type: 'wall' });
  } else {
    obstacles.push({ id: `${room.id}_wall_b`, x: worldX, y: worldY + height - WALL_THICKNESS, width, height: WALL_THICKNESS, type: 'wall' });
  }

  // LEFT WALL
  if (doors.left) {
    obstacles.push({ id: `${room.id}_wall_l1`, x: worldX, y: worldY + WALL_THICKNESS, width: WALL_THICKNESS, height: topH - WALL_THICKNESS, type: 'wall' });
    obstacles.push({ id: `${room.id}_wall_l2`, x: worldX, y: worldY + topH + DOOR_WIDTH, width: WALL_THICKNESS, height: topH - WALL_THICKNESS, type: 'wall' });
  } else {
    obstacles.push({ id: `${room.id}_wall_l`, x: worldX, y: worldY + WALL_THICKNESS, width: WALL_THICKNESS, height: height - 2 * WALL_THICKNESS, type: 'wall' });
  }

  // RIGHT WALL
  if (doors.right) {
    obstacles.push({ id: `${room.id}_wall_r1`, x: worldX + width - WALL_THICKNESS, y: worldY + WALL_THICKNESS, width: WALL_THICKNESS, height: topH - WALL_THICKNESS, type: 'wall' });
    obstacles.push({ id: `${room.id}_wall_r2`, x: worldX + width - WALL_THICKNESS, y: worldY + topH + DOOR_WIDTH, width: WALL_THICKNESS, height: topH - WALL_THICKNESS, type: 'wall' });
  } else {
    obstacles.push({ id: `${room.id}_wall_r`, x: worldX + width - WALL_THICKNESS, y: worldY + WALL_THICKNESS, width: WALL_THICKNESS, height: height - 2 * WALL_THICKNESS, type: 'wall' });
  }

  // Interior Decorations & Functional Objects based on Room Type
  const cx = worldX + width / 2;
  const cy = worldY + height / 2;

  if (type === 'combat') {
    // Add pillars / covers / destructible wooden crates / explosive barrels
    const layoutType = Math.floor(Math.random() * 4);
    if (layoutType === 0) {
      // 4 symmetric corner pillars
      const offsets = [
        { ox: -160, oy: -100 },
        { ox: 160, oy: -100 },
        { ox: -160, oy: 100 },
        { ox: 160, oy: 100 },
      ];
      offsets.forEach((o, i) => {
        obstacles.push({
          id: `${room.id}_pillar_${i}`,
          x: cx + o.ox - 24,
          y: cy + o.oy - 24,
          width: 48,
          height: 48,
          type: 'wall',
        });
      });
    } else if (layoutType === 1) {
      // Center barricade with destructible crates
      obstacles.push({
        id: `${room.id}_crate_c1`,
        x: cx - 40,
        y: cy - 40,
        width: 36,
        height: 36,
        type: 'crate',
        hp: 10,
        maxHp: 10,
        isDestructible: true,
      });
      obstacles.push({
        id: `${room.id}_crate_c2`,
        x: cx + 4,
        y: cy - 40,
        width: 36,
        height: 36,
        type: 'crate',
        hp: 10,
        maxHp: 10,
        isDestructible: true,
      });
      obstacles.push({
        id: `${room.id}_crate_c3`,
        x: cx - 40,
        y: cy + 4,
        width: 36,
        height: 36,
        type: 'crate',
        hp: 10,
        maxHp: 10,
        isDestructible: true,
      });
      obstacles.push({
        id: `${room.id}_crate_c4`,
        x: cx + 4,
        y: cy + 4,
        width: 36,
        height: 36,
        type: 'barrel_explosive',
        hp: 8,
        maxHp: 8,
        isDestructible: true,
      });
    }

    // Add scatter crates and explosive barrels in corners
    const numCrates = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numCrates; i++) {
      const angle = (i / numCrates) * Math.PI * 2;
      const dist = 180 + Math.random() * 80;
      const isExplosive = Math.random() < 0.25;
      obstacles.push({
        id: `${room.id}_scrate_${i}`,
        x: cx + Math.cos(angle) * dist - 18,
        y: cy + Math.sin(angle) * dist - 18,
        width: 34,
        height: 34,
        type: isExplosive ? 'barrel_explosive' : 'crate',
        hp: isExplosive ? 6 : 10,
        maxHp: isExplosive ? 6 : 10,
        isDestructible: true,
      });
    }
  } else if (type === 'chest') {
    // High tier treasure chest in center
    const chestWeaponRarity = stage === 1 ? 'uncommon' : stage === 2 ? 'rare' : 'epic';
    const rewardWeapon = getRandomWeapon(chestWeaponRarity);
    room.chestReward = {
      weapon: rewardWeapon,
      gold: 25 + stage * 15,
      energy: 50 + stage * 25,
      opened: false,
    };
    obstacles.push({
      id: `${room.id}_chest`,
      x: cx - 24,
      y: cy - 20,
      width: 48,
      height: 40,
      type: 'chest',
      opened: false,
    });

    // Decorative treasure pillars
    obstacles.push({
      id: `${room.id}_tp_1`,
      x: cx - 120,
      y: cy - 20,
      width: 36,
      height: 36,
      type: 'wall',
    });
    obstacles.push({
      id: `${room.id}_tp_2`,
      x: cx + 84,
      y: cy - 20,
      width: 36,
      height: 36,
      type: 'wall',
    });
  } else if (type === 'shop') {
    // 3 Shop items: weapons and potions
    const shopRarity = stage === 1 ? 'uncommon' : stage === 2 ? 'rare' : 'epic';
    const w1 = getRandomWeapon(shopRarity);
    const w2 = Math.random() < 0.6 ? getRandomWeapon(shopRarity) : undefined;

    room.shopItems = [
      {
        weapon: w1,
        cost: 20 + stage * 10,
        bought: false,
        x: cx - 120,
        y: cy + 10,
      },
      {
        weapon: w2,
        potionType: w2 ? undefined : 'hp',
        cost: w2 ? 25 + stage * 12 : 12,
        bought: false,
        x: cx,
        y: cy + 10,
      },
      {
        potionType: 'energy',
        cost: 10,
        bought: false,
        x: cx + 120,
        y: cy + 10,
      },
    ];

    room.shopItems.forEach((item, idx) => {
      obstacles.push({
        id: `${room.id}_shop_pedestal_${idx}`,
        x: item.x - 22,
        y: item.y - 22,
        width: 44,
        height: 44,
        type: 'shop_item',
        data: item,
      });
    });
  } else if (type === 'statue') {
    // Hero Statue
    const statues = [
      { name: 'Statue of the Knight', cost: 15, type: 'knight_buff' },
      { name: 'Statue of the Paladin', cost: 20, type: 'paladin_buff' },
      { name: 'Statue of the Assassin', cost: 15, type: 'assassin_buff' },
      { name: 'Statue of the Priest', cost: 20, type: 'priest_buff' },
      { name: 'Statue of the Wizard', cost: 20, type: 'wizard_buff' },
    ];
    const chosen = statues[Math.floor(Math.random() * statues.length)];
    room.statueBlessing = { ...chosen, prayed: false };

    obstacles.push({
      id: `${room.id}_statue`,
      x: cx - 26,
      y: cy - 36,
      width: 52,
      height: 72,
      type: 'statue',
    });
  } else if (type === 'upgrade') {
    // Upgrade Forge Room: Blacksmith Anvil & Magic Wishing Spring
    room.upgradeForge = {
      cost: 20 + stage * 10,
      upgraded: false,
      level: 1,
    };
    room.magicSpring = {
      cost: 15,
      used: false,
    };

    // Blacksmith Anvil
    obstacles.push({
      id: `${room.id}_anvil`,
      x: cx - 90,
      y: cy - 24,
      width: 54,
      height: 48,
      type: 'upgrade_anvil',
      data: room.upgradeForge,
    });

    // Magic Wishing Spring
    obstacles.push({
      id: `${room.id}_spring`,
      x: cx + 45,
      y: cy - 24,
      width: 54,
      height: 48,
      type: 'magic_spring',
      data: room.magicSpring,
    });
  } else if (type === 'portal') {
    obstacles.push({
      id: `${room.id}_portal`,
      x: cx - 30,
      y: cy - 30,
      width: 60,
      height: 60,
      type: 'portal',
    });
  }

  room.obstacles = obstacles;
}

