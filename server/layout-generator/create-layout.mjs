//import db from "../db/conn.mjs";
import sharp from "sharp";
import * as fs from 'fs';
import createStitchedImage from "./create-stitched-image.mjs";
/*
const createLayout;
Creates a functional layout object of notes and images
Inputs: 
* pattern: a 2D array containing Note ObjectIDs

Output:
* Uploads a directory of DZI files to AWS S3 bucket
* Inserts a layout object to Mongo Atlas
* Returns the ObjectID of the newly inserted layout object

Side effects:
* Generates large temp files which are deleted upon program termination

*/
const createLayout = async (pattern,options) => {

    const totalSteps = 3;

    if (pattern == null) {

        if (options.fromDisk) {
            console.log(`[1/${totalSteps}] Initializing layout from disk.`)
            const data = fs.readFileSync('./layout-generator/temp/layout.json');
            pattern = await JSON.parse(data).array;
            console.log(`[1/${totalSteps}] Initializing read pattern from disk.`)
        }
        else {
            console.error('Error: a pattern is required to generate a layout.');
            return;
        }
    }
    else {
        console.log(`[1/${totalSteps}] Initializing layout from provided pattern.`)
    }
    // Initialize layout object
    const layout = {
        name:options.name,
        numRows:pattern.length,
        numCols:pattern[0].length,
        noteImageSize:288,
        array:pattern,
        dzi:null
    }
    console.log(`[1/${totalSteps} DONE] Successfully initialized layout with pattern.`)
    console.log(`[2/${totalSteps}] Creating stitched image`)
    const stitchedTiff= await createStitchedImage(layout,{
        fromDisk:options.fromDisk,
        saveFile:options.saveFile
    })
    console.log(`[2/${totalSteps} DONE] Stitched image created.`);
    console.log(`[3/${totalSteps}] Generating DZI`)
    const DZI_IMAGE = stitchedTiff || `./layout-generator/temp/${layout.name}-stitched.tiff`
    // Generate dzi directory in temp folder
    await sharp(DZI_IMAGE)
    .jpeg()
    .tile({
        size:576
    })
    .toFile(`./layout-generator/temp/${layout.name}-dzi.dz`, (err, info) => {
        console.log(err,info)
    })
    
    if (options.saveFile) {
        await fs.writeFileSync(`./layout-generator/temp/${layout.name}-layout.json`, JSON.stringify(layout));
    }
    console.log('[3/3 DONE] Process complete. file saved.')

    // 5. upload all dzi files to s3

    // 6. update layout object with dzi metadata and S3 URL

    // 7. insert layout object to mongo atlas

    // 8. delete temp files
}

export default createLayout;