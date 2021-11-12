import LoopBuffer from '../audio/loopPlayer/loopBuffer';
import { AudiencePos } from '../client/AudienceAPI';

/**
 * Assigns volumes of loops to 0 or 1 based on whether the pos is
 * in the radius of the loop's position
 * @param loops loops to assign volumes to
 * @param pos position of the client
 */
export const assignVolumeSimpleRadius = (
  loops: Record<string, LoopBuffer>,
  pos: AudiencePos,
): boolean => {
  let wasChanged = false;
  Object.values(loops).forEach((loop) => {
    const dist = Math.sqrt(Math.pow(loop.pos.x - pos.x, 2) + Math.pow(loop.pos.y - pos.y, 2));
    const isMuted = dist > loop.pos.radius;
    if (isMuted !== loop.isMuted) {
      wasChanged = true;
      loop.setVolume(isMuted ? 0 : 1);
    }
  });

  return wasChanged;
};
