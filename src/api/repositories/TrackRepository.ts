import { EntityRepository, Repository } from 'typeorm';
import { Track } from '@api/models/Track';


@EntityRepository(Track)
export class TrackRepository extends Repository<Track> {
  async createTrack(data: Partial<Track>) {
    const track = this.create(data);
    return this.save(track);
  }
}
