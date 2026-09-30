import fs from 'fs';

async function run() {
  const res = await fetch('https://embed.figma.com/design/2LdqwzjMHMVa6Hx7GlSLLj/Muloqot?embed-host=oembed&node-id=7-1695');
  const html = await res.text();
  console.log('HTML length:', html.length);
  fs.writeFileSync('scratch_embed.html', html);
  
  const urls = html.match(/https:\/\/[^"'\s<>]+/g) || [];
  const cdnUrls = Array.from(new Set(urls.filter(u => u.includes('figma.com') || u.includes('thumbnails') || u.includes('s3') || u.includes('aws'))));
  console.log('Found CDN URLs:', cdnUrls);
}

run().catch(console.error);
