const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: 'davgu5v34',
  api_key: '382466491421122',
  api_secret: 's0X9lUyuE_9ih7LtrImduetmO6A'
});

async function run() {
  try {
    // 2. Upload an image
    const sampleImageUrl = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
    console.log(`Uploading image from ${sampleImageUrl}...`);
    
    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
      public_id: 'my_sample_upload'
    });
    
    console.log('Upload successful!');
    console.log('Secure URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    console.log('----------------------------------------');

    // 3. Get image details
    console.log('Image Details:');
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`File size: ${uploadResult.bytes} bytes`);
    console.log('----------------------------------------');

    // 4. Transform the image
    // Generating a transformed URL
    // f_auto: Automatically selects the most efficient image format based on the requesting browser.
    // q_auto: Automatically adjusts compression to minimize file size without visible degradation.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
    console.log(transformedUrl);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

run();
