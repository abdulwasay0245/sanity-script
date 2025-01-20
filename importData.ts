

// async function uploadImageToSanity(imageUrl: string): Promise<string> {
  
//   try {
//       // Fetch the image from the URL and convert it to a buffer
//       const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//       const buffer = Buffer.from(response.data);

//       // Upload the image to Sanity
//       const asset = await client.assets.upload('image', buffer, {
//         filename: imageUrl.split('/').pop(), // Extract the filename from URL
//       });

//       // Debugging: Log the asset returned by Sanity
//       console.log('Image uploaded successfully:', asset);

//       return asset._id; // Return the uploaded image asset reference ID
//     } catch (error) {
//       console.error('❌ Failed to upload image:', imageUrl, error);
//       throw error;
//     }
//   }
  
  import axios from 'axios';
  import { client } from './sanityClient.js';
async function uploadImageToSanity(image: string) {
    
  console.log(`Uploading image: ${image}`);
  
  const response = await fetch(image);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${image}`);
  }
  
  const buffer = await response.arrayBuffer();
  const bufferImage = Buffer.from(buffer);
  
  const asset = await client.assets.upload('image', bufferImage, {
    filename: image.split('/').pop(),
  });
  
  console.log(`Image uploaded successfully: ${asset._id}`);
  return asset._id;
    
}

 

async function importData() {
  try {
    // Fetch data from the provided API endpoint
    const response = await axios.get('https://67881355c4a42c9161093d3b.mockapi.io/furniture');
    const products = response.data;

    // Iterate over the products
    for (const product of products) {
      let imageRef: string | null = null;

      // Check if 'imageUrl' property exists and upload image if available
      if (product.image) {
        try {
          imageRef = await uploadImageToSanity(product.image);
          if (!imageRef) {
            console.warn(`Failed to upload image for product: ${product.name}`);
          }
        } catch (error) {
          console.error(`Error uploading image for product: ${product.name}`, error);
        }
      }

      // Create the Sanity product object with mapped properties
      const sanityProduct = {
        _id: `product-${product.id}`, // Ensure unique ID with prefix
        _type: 'product',
        name: product.name, // Assuming 'name' property exists
        price: product.price, // Assuming 'price' property exists (handle missing data if needed)
        // ... other properties mapped from product data (add as needed)
        image: imageRef
          ? { _type: 'image', asset: { _ref: imageRef } }
          : null, // Set image reference if uploaded, otherwise null
      };

      // Log the product before import
      console.log('Uploading product:', sanityProduct);

      // Import data into Sanity
      await client.createOrReplace(sanityProduct);
      console.log(`✅ Imported product: ${sanityProduct._id}`);
    }

    console.log('✅ Data import completed!');
  } catch (error) {
    console.error('❌ Error importing data:', error);
  }
}

importData();