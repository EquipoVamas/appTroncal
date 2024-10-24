import RNFS from 'react-native-fs';

export const convertImageToBase64 = async (imagePath : any) => {
  try {
    const base64Image = await RNFS.readFile(imagePath, 'base64');
    return base64Image;
  } catch (error) {
    throw error
  }
};

export const lightenColor = (hexColor: any, factor:any) => {
  if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
  }

  const num = parseInt(hexColor, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.floor(r + (255 - r) * factor));
  g = Math.min(255, Math.floor(g + (255 - g) * factor));
  b = Math.min(255, Math.floor(b + (255 - b) * factor));

  const newColor = (r << 16) | (g << 8) | b;
  return `#${newColor.toString(16).padStart(6, '0')}`;
}


/**
 * TODO(developer): Update these variables before running the sample.
 */
// export const createNonStreamingMultipartContent = async (
//   image : any,
//   type : any
// ) => {
//   // Initialize Vertex with your Cloud project and location
//   const vertexAI = new VertexAI({project: 'vamas-429217', location: 'us-central1'});

//   // Instantiate the model
//   const generativeVisionModel = vertexAI.getGenerativeModel({
//     model: 'gemini-flash-experimental',
//   });

//   // For images, the SDK supports both Google Cloud Storage URI and base64 strings
//   const filePart = {
//     fileData: {
//       fileUri: image,
//       mimeType: type,
//     },
//   };

//   const textPart = {
//     text: '¿Cuál es sólo el número dBm? Sin descripción',
//   };

//   const request = {
//     contents: [{role: 'user', parts: [filePart, textPart]}],
//   };

//   // Create the response stream
//   const responseStream =
//     await generativeVisionModel.generateContentStream(request);

//   // Wait for the response stream to complete
//   const aggregatedResponse :any = await responseStream.response;

//   // Select the text from the response
//   const fullTextResponse :any = aggregatedResponse.candidates[0].content.parts[0].text;

// }


