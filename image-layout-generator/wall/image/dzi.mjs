import { LayoutImage } from "./layoutImage.mjs";
import { getDziIdByName, insertOrUpdateDzi } from "../../db/crud-dzis.mjs";

export class DZI extends LayoutImage {
  constructor(layout) {
    super(layout);
    this.name = `${layout.name}-dzi`;

    if (this.layout.image) {
      // DZI already exists in DB
      this.fromDb();
    }
  }
  fromDb() {

  }

  async init(options,callback) {
    this.setInfo();
    await this.generate(options.saveFiles);
    callback.bind(this)();
  }

  setInfo() {
    this.xmlns = "http://schemas.microsoft.com/deepzoom/2008";
    this.Format = 'jpeg';
    this.Overlap = 0;
    this.TileSize = this.layout.noteImageSize*2;
    this.Height = this.layout.numRows * this.layout.noteImageSize;
    this.Width = this.layout.numCols * this.layout.noteImageSize; 
  }

  async generate(saveFiles) {   
    throw new Error('Method generate of DZI does not currently work, use class DZIFromStitch instead.');

    // TODO create a DZI procedurally from a 2D pattern of notes :)
  }

  toJson() {
    return {
      _id:this._id,
      name:this.name,
      Image: {
        Url: this.Url,
        xmlns: this.xmlns,
        Format: this.Format,
        Overlap: this.Overlap,
        TileSize: this.TileSize,
        Size: {
          Height:this.Height,
          Width:this.Width
        }
      }
    }
  }

  async insert() {

    console.log('[DB] Inserting DZI...');

    const dziObj = this.toJson();
    this._id = await insertOrUpdateDzi(dziObj);

    if (!this._id) {
      this._id = await getDziIdByName(dziObj.name);
    }

    console.log(`[DB DONE] Successfully inserted new DZI at ${this._id}`);

    return this._id;
  }

  async uploadToS3() {
    // This method will simply upload a list of buffers from memory. See 'dziFromStitch' for a program that crawls a directory
    throw new Error('DZI upload from buffer not supported, use class \'DZIFromStitch\' instead.');
  }
}

const dzi = (layout) => {
  return new DZI(layout);
}

export default dzi;