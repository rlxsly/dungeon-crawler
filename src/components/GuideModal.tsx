import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Gamepad2,
  Swords,
  Shield,
  Zap,
  Coins,
  Gem,
  Sparkles,
  Flame,
  Award,
  Compass,
  Layers,
  Heart,
  Crosshair,
  Repeat,
} from 'lucide-react';

interface GuideModalProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose, isEmbedded = false }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'controls' | 'rooms' | 'guardians' | 'rarity'>('basics');

  const content = (
    <div className={`flex flex-col overflow-hidden w-full ${isEmbedded ? 'h-full' : 'max-h-[92vh]'}`}>
      {/* HEADER (IF POPUP) */}
      {!isEmbedded && (
        <div className="flex items-center justify-between border-b-2 border-[#252545] p-4 bg-[#121224]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0c0c16] border-2 border-[#3effc3] flex items-center justify-center text-[#3effc3] shadow-[2px_2px_0px_#000]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-[#3effc3] font-black uppercase tracking-widest">
                OUTPOST HANDBOOK
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                DUNGEON CRAWLERS SURVIVAL GUIDE
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 bg-[#0c0c16] hover:bg-[#252545] text-[#8a8aa8] hover:text-white border border-[#252545] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-1.5 p-3 bg-[#141428] border-b-2 border-[#252545] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('basics')}
          className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer border-2 whitespace-nowrap ${
            activeTab === 'basics'
              ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
              : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:text-white'
          }`}
        >
          BASICS & SURVIVAL
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer border-2 whitespace-nowrap ${
            activeTab === 'controls'
              ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
              : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:text-white'
          }`}
        >
          CONTROLS & SHORTCUTS
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer border-2 whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
              : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:text-white'
          }`}
        >
          RANDOM ROOMS & EVENTS
        </button>
        <button
          onClick={() => setActiveTab('guardians')}
          className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer border-2 whitespace-nowrap ${
            activeTab === 'guardians'
              ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
              : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:text-white'
          }`}
        >
          ANCIENT GUARDIANS
        </button>
        <button
          onClick={() => setActiveTab('rarity')}
          className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer border-2 whitespace-nowrap ${
            activeTab === 'rarity'
              ? 'bg-[#3effc3] text-[#0c0c16] border-[#3effc3] shadow-[2px_2px_0px_#000]'
              : 'bg-[#0c0c16] text-[#8a8aa8] border-[#252545] hover:text-white'
          }`}
        >
          WEAPON RARITY TIERS
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 max-h-[55vh] space-y-4">
        {/* TAB 1: BASICS */}
        {activeTab === 'basics' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 bg-[#0c0c16] border-2 border-[#3effc3] shadow-[3px_3px_0px_#000]">
              <h4 className="text-sm font-black text-[#3effc3] uppercase mb-1 flex items-center gap-1.5">
                <Swords className="w-4 h-4" /> CORE MISSION
              </h4>
              <p className="text-[#c0c0d8]">
                Delve into dangerous procedurally generated dungeon chambers across multiple stages. Slay
                monsters, discover powerful weapons, defeat floor bosses, and escape via the ancient portal!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0c0c16] border border-[#ff3e3e]">
                <div className="flex items-center gap-1.5 text-[#ff3e3e] font-black uppercase text-xs mb-1">
                  <Heart className="w-3.5 h-3.5 fill-current" /> HEALTH (HP)
                </div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Your life force. Taking direct damage when your shield is broken reduces HP. Reaching 0 HP results in defeat.
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#3e93ff]">
                <div className="flex items-center gap-1.5 text-[#3e93ff] font-black uppercase text-xs mb-1">
                  <Shield className="w-3.5 h-3.5 fill-current" /> ENERGY SHIELD
                </div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Absorbs all incoming damage before HP is harmed. Regenerates automatically after taking no hits for a short duration!
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#ffd700]">
                <div className="flex items-center gap-1.5 text-[#ffd700] font-black uppercase text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 fill-current" /> ENERGY MANA
                </div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Consumed when firing powerful guns, bows, and staves. Slaying enemies and breaking pots drop mana crystals to replenish energy.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#141428] border border-[#252545]">
              <h4 className="text-xs font-black text-white uppercase mb-1">PRO-TIP: BULLET REFLECTION</h4>
              <p className="text-[11px] text-[#8a8aa8]">
                Melee blades (swords, katanas, axes) can slash through enemy projectiles, deflecting and sending them straight back at the monsters!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* KEYBOARD / MOUSE */}
              <div className="p-3 bg-[#0c0c16] border-2 border-[#252545]">
                <h4 className="text-xs font-black text-[#3effc3] uppercase mb-2 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" /> KEYBOARD & MOUSE
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Movement</span>
                    <span className="font-bold text-white">W / A / S / D or Arrow Keys</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Attack / Fire</span>
                    <span className="font-bold text-white">Left Click or J</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Hero Skill</span>
                    <span className="font-bold text-white">K or Right Click</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Switch Weapon</span>
                    <span className="font-bold text-white">Q or L</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Interact / Open / Buy</span>
                    <span className="font-bold text-white">E or Spacebar</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8aa8]">Pause Game</span>
                    <span className="font-bold text-white">Escape / P</span>
                  </div>
                </div>
              </div>

              {/* MOBILE TOUCH */}
              <div className="p-3 bg-[#0c0c16] border-2 border-[#252545]">
                <h4 className="text-xs font-black text-[#ffd700] uppercase mb-2 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4" /> MOBILE & TOUCHSCREEN
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Virtual Joystick</span>
                    <span className="font-bold text-white">Left side drag & move</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Fire Button (Big Red)</span>
                    <span className="font-bold text-white">Hold to shoot continuously</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Skill Button (Yellow)</span>
                    <span className="font-bold text-white">Tap to unleash hero ultimate</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#252545] pb-1">
                    <span className="text-[#8a8aa8]">Swap Weapon (Blue)</span>
                    <span className="font-bold text-white">Tap to cycle primary/secondary</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a8aa8]">Interact Button (Green)</span>
                    <span className="font-bold text-white">Appears near chests, shops & shrines</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROOMS */}
        {activeTab === 'rooms' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#8a8aa8]">
              Every dungeon floor randomizes its special chambers and events dynamically:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#0c0c16] border border-[#ffd700]">
                <div className="text-xs font-black text-[#ffd700] uppercase mb-0.5">MERCHANT OUTPOST (SHOP)</div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Contains 3 randomized weapons, health potions, energy potions, and stat elixirs for gold.
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#3effc3]">
                <div className="text-xs font-black text-[#3effc3] uppercase mb-0.5">TREASURE VAULT (CHEST)</div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Contains free high-tier weapon chests and instant supplies.
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#c084fc]">
                <div className="text-xs font-black text-[#c084fc] uppercase mb-0.5">ANCIENT GUARDIAN SHRINE</div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Offer gold to receive permanent run-long blessings from legendary guardians.
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#fb923c]">
                <div className="text-xs font-black text-[#fb923c] uppercase mb-0.5">FORGE & WISHING SPRING</div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Upgrade weapon damage and critical strike stats, or drink from magic springs for max HP and buffs.
                </p>
              </div>

              <div className="p-3 bg-[#0c0c16] border border-[#ff3e3e] sm:col-span-2">
                <div className="text-xs font-black text-[#ff3e3e] uppercase mb-0.5">BOSS CHAMBER & TURN BATTLE</div>
                <p className="text-[11px] text-[#a0a0c0]">
                  Defeat the supreme dungeon boss to unlock the portal and collect abundant gem rewards!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GUARDIANS */}
        {activeTab === 'guardians' && (
          <div className="space-y-3 text-xs">
            <p className="text-[#8a8aa8]">
              Praying at Guardian Shrines grants unique tactical blessings for your run:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#3effc3]">Guardian of the Knight</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Grants +3 Base Attack Damage to all weapons.
                </p>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#3e93ff]">Guardian of the Paladin</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Grants +3 Max Energy Shield armor.
                </p>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#10b981]">Guardian of the Assassin</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Grants +25% Critical Hit Strike Chance.
                </p>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#f59e0b]">Guardian of the Priest</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Grants +3 Maximum Health and immediate recovery.
                </p>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#a855f7]">Guardian of the Wizard</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Grants +50 Maximum Energy and faster mana recovery.
                </p>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border border-[#252545]">
                <span className="font-bold text-[#ef4444]">Guardian of the Berserker</span>
                <p className="text-[11px] text-[#8a8aa8] mt-0.5">
                  Increases weapon fire rate by +30%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RARITY */}
        {activeTab === 'rarity' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#94a3b8] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#94a3b8] uppercase">COMMON (WHITE)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Standard starter sidearms, rusty swords, and basic bows.</div>
                </div>
                <span className="text-[10px] text-[#8a8aa8] font-bold">TIER 1</span>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#22c55e] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#22c55e] uppercase">UNCOMMON (GREEN)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Enhanced automatic rifles, frost swords, and assault shotguns.</div>
                </div>
                <span className="text-[10px] text-[#22c55e] font-bold">TIER 2</span>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#3b82f6] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#3b82f6] uppercase">RARE (BLUE)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Laser rifles, Gatling guns, elemental staves, and katana blades.</div>
                </div>
                <span className="text-[10px] text-[#3b82f6] font-bold">TIER 3</span>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#a855f7] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#a855f7] uppercase">EPIC (PURPLE)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Thunder hammers, rocket launchers, and high-velocity snipers.</div>
                </div>
                <span className="text-[10px] text-[#a855f7] font-bold">TIER 4</span>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#f59e0b] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#f59e0b] uppercase">LEGENDARY (ORANGE)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Soul Calibre, Death Note, One Punch, and Excalibur.</div>
                </div>
                <span className="text-[10px] text-[#f59e0b] font-bold">TIER 5</span>
              </div>

              <div className="p-2.5 bg-[#0c0c16] border-l-4 border-[#ef4444] flex items-center justify-between">
                <div>
                  <div className="font-black text-[#ef4444] uppercase">MYTHIC (RED)</div>
                  <div className="text-[11px] text-[#8a8aa8]">Divine anime artifacts: Hollow Purple, Kamehameha, Spirit Bomb, Rasenshuriken.</div>
                </div>
                <span className="text-[10px] text-[#ef4444] font-bold">TIER 6 (MAX)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER (IF POPUP) */}
      {!isEmbedded && onClose && (
        <div className="p-3 bg-[#121224] border-t-2 border-[#252545] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#3effc3] hover:bg-[#34e0ab] text-[#0c0c16] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] cursor-pointer"
          >
            GOT IT, LET'S CRAWL!
          </button>
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c16]/90 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-150 font-mono">
      <div className="bg-[#1a1a2e] border-2 border-[#252545] shadow-[10px_10px_0px_#000] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {content}
      </div>
    </div>
  );
};
