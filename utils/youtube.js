const axios = require("axios");
const { YOUTUBE_API_KEY } = require("../config/constant");

// Function to search for YouTube videos based on the section title
const searchYouTubeVideos = async (sectionTitle) => {
  try {
    const apiKey = YOUTUBE_API_KEY; // Replace with your YouTube API key
    const searchQuery = encodeURIComponent(`${sectionTitle} tutorial`); // Add "tutorial" to get more relevant results
    const maxResults = 2; // Maximum number of results to retrieve

    const searchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&key=${apiKey}&maxResults=${maxResults}`
    );

    // console.log(searchResponse);

    const videoIds = searchResponse.data.items.map((item) => item.id.videoId);
    const videoInfoResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(
        ","
      )}&key=${apiKey}`
    );

    const videoData = videoInfoResponse.data.items.map((item) => ({
      link: `https://www.youtube.com/watch?v=${item.id}`,
      title: item.snippet.title,
      videoLength: parseDuration(item.contentDetails.duration),
      description: item.snippet.description,
    }));

    return videoData;
  } catch (error) {
    console.log("Error searching YouTube videos:", error.message);
    return [];
  }
};

// Helper function to parse video duration in ISO 8601 format to seconds
const parseDuration = (isoDuration) => {
  const durationRegex = /PT((\d+)H)?((\d+)M)?((\d+)S)?/;
  const matches = isoDuration.match(durationRegex);
  const hours = matches[2] ? parseInt(matches[2]) : 0;
  const minutes = matches[4] ? parseInt(matches[4]) : 0;
  const seconds = matches[6] ? parseInt(matches[6]) : 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// // Example usage:
// const sectionTitle = "Introduction";
// searchYouTubeVideos(sectionTitle)
//   .then((videoData) => {
//     console.log(`Here are some relevant YouTube videos for "${sectionTitle}":`);
//     console.log(videoData);
//   })
//   .catch((error) => {
//     console.log("Error:", error.message);
//   });

exports.searchYouTubeVideos = searchYouTubeVideos;
