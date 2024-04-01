class Video {
    constructor(data, index) {
        this.title = data.title;
        this.url = data.url;
        this.website = data.website;
        this.category = data.category;
        this.videoId = data.videoId;
        this.thumbnail = data.thumbnail;
        this.likes = data.likes || 0;
        this.views = data.views || 0;
        this.index = index; // Store the index of the video

        // Check if the video is not the watermark video
        const isNotWatermarkVideo = this.title !== 'Watermark Video'; // Assuming the title is unique

        // Set default watch time and times played
        if (isNotWatermarkVideo) {
            this.watchTime = '00:00'; // Default watch time
            this.timesPlayed = 0; // Default times played
        }
    }

    play() {
        console.log(`Playing "${this.title}" from ${this.url}`);
        // You can implement the logic to play the video here
    }

    // Other methods (pause, like, view, changeVolume) can be added here
}
class VideoPlayer {
    constructor() {
        this.isLoaded = false;
        this.isShowingVideo = false;
        this.originalParents = {};
        this.videoIndexMap = {};
        this.isPlaying = false; // Add isPlaying as a property of the class
    }

    // Rest of the VideoPlayer class implementation
    // ...
    createLoadingSkeleton() {
        const videoContainer = document.getElementById('video-container');
        videoContainer.innerHTML = ''; // Clear the existing video container

        const skeletonCount = 9; // Number of skeleton videos to display

        for (let i = 0; i < skeletonCount; i++) {
            const skeletonVideo = document.createElement('div');
            skeletonVideo.classList.add('skeleton-video');

            const skeletonThumbnail = document.createElement('div');
            skeletonThumbnail.classList.add('skeleton-thumbnail');
            skeletonVideo.appendChild(skeletonThumbnail);

            const skeletonTitle = document.createElement('div');
            skeletonTitle.classList.add('skeleton-title');
            skeletonVideo.appendChild(skeletonTitle);

            videoContainer.appendChild(skeletonVideo);
        }
    }

    closeRecord() {
        // Code to close the overlay view
        // For example, remove the overlay element from the DOM
        const overlayElement = document.querySelector('.overlay-view');
        if (overlayElement) {
            overlayElement.remove();
            this.isOverlayOpen = false; // Reset the flag
        }
    }

    showVideoRecordOverlay(video, mouseX, mouseY) {
        // Check if overlay view is already open, if so, close it
        if (this.isOverlayOpen) {
            this.closeRecord();
        }

        // Create and display overlay view for the video
        const overlayView = document.createElement('div');
        overlayView.classList.add('overlay-view');

        // Set the position of the overlay view based on the mouse coordinates
        overlayView.style.left = mouseX + 'px';
        overlayView.style.top = mouseY + 'px';

        // Add content and styling for the overlay view
        // For example:
        overlayView.innerHTML = `
        <div class="overlay-content">
            <h2>${video.title}</h2>
            <p>Watch Time: ${video.watchTime}</p>
            <p>Times Played: ${video.timesPlayed}</p>
            <!-- Add more information as needed -->
            <button class="close-button">Close</button>
        </div>
    `;

        // Add event listener to close button
        overlayView.querySelector('.close-button').addEventListener('click', () => {
            this.closeRecord();
        });

        // Append overlay view to the document body
        document.body.appendChild(overlayView);

        // Set flag to indicate that overlay view is open
        this.isOverlayOpen = true;
    }



    watermarkVideo(){
        // Create and play the watermark video
        const watermarkVideo = new Video({
            title: 'Watermark Video',
            url: 'watermarkvid.mp4', // Adjust the URL to the watermark video
            category: 'Advertisement' // Assign a category to the watermark video
            // Other properties as needed
        });

        // Create video element for the watermark video
        const watermarkVideoElement = this.createVideoElement(watermarkVideo, document.createElement('div'));
        watermarkVideoElement.classList.add('overlay'); // Add the overlay class

        // Set loop attribute to false to prevent looping
        watermarkVideoElement.querySelector('video').loop = false;

        // Create overlay dialog to display the watermark video
        const overlayDialog = document.createElement('dialog');
        overlayDialog.classList.add('overlay');
        overlayDialog.appendChild(watermarkVideoElement);
        document.body.appendChild(overlayDialog);

        // Play the watermark video
        const watermarkVideoPlayer = watermarkVideoElement.querySelector('video');

        // Event listener to remove the overlay dialog after watermark video finishes
        const endedHandler = () => {
            watermarkVideoPlayer.pause(); // Pause the video
            overlayDialog.close(); // Close the overlay dialog
            overlayDialog.remove(); // Remove the overlay dialog from the DOM
            watermarkVideoElement.remove(); // Remove the watermark video element from the DOM

            // Remove the 'ended' event listener
            watermarkVideoPlayer.removeEventListener('ended', endedHandler);

            // Resume playing the next video or other operations as needed
        };
        watermarkVideoPlayer.addEventListener('ended', endedHandler);

        watermarkVideoPlayer.play(); // Play the watermark video after adding the event listener
    }


    createVideosByCategory(category) {
        this.createLoadingSkeleton(); // Show loading skeleton
        fetch('videos.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const videoContainer = document.getElementById('video-container');
                videoContainer.innerHTML = ''; // Clear the existing video container

                const filteredVideos = data.filter(video => video.category === category);

                filteredVideos.forEach((videoData, index) => {
                    const video = new Video(videoData, index);
                    this.videoIndexMap[video.videoId] = index;
                    this.createVideoElement(video, videoContainer);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    startLoading() {
        setTimeout(() => {
            if (!document.querySelector('.loading-overlay')) {
                var loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay';
                var spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                loadingOverlay.appendChild(spinner);
                document.body.appendChild(loadingOverlay);
                document.addEventListener('click', () => this.stopLoading(), { once: true });
            }
        }, 5000);
    }

    stopLoading() {
        setTimeout(() => {
            var loadingOverlay = document.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }, 5000);
    }

    showVideoScreen(videoPlayer) {
        const dialog = document.createElement('dialog');
        dialog.classList.add('overlaying');
        videoPlayer.classList.add('films')
        dialog.appendChild(videoPlayer);
        document.body.appendChild(dialog);
        dialog.showModal();
        return dialog;
    }

    hideVideoScreen(dialog) {
        dialog.close();
        dialog.remove();
    }

    fetchAndCreateVideos() {
        this.createLoadingSkeleton(); // Show loading skeleton
        fetch('videos.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const videoContainer = document.getElementById('video-container');
                videoContainer.innerHTML = ''; // Clear the existing video container

                data.forEach((videoData, index) => {
                    const video = new Video(videoData, index);
                    this.videoIndexMap[video.videoId] = index;
                    this.createVideoElement(video, videoContainer);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }


    fetchAndCreateRandomVideos() {
        this.createLoadingSkeleton(); // Show loading skeleton
        fetch('videos.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const videoContainer = document.getElementById('video-container');
                videoContainer.innerHTML = ''; // Clear the existing video container

                // Shuffle the array of video data
                const shuffledData = this.shuffleArray(data);

                shuffledData.forEach((videoData, index) => {
                    const video = new Video(videoData, index);
                    this.videoIndexMap[video.videoId] = index;
                    this.createVideoElement(video, videoContainer);
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    // Function to shuffle an array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    createVideoElement(video, videoContainer) {
        // Create video HTML elements
        const videoElement = document.createElement('div');
        videoElement.classList.add('video');

        const overlaying = document.createElement('div');
        overlaying.classList.add('overlay');

        const videoTitle = document.createElement('h2');
        videoTitle.textContent = video.title;
        videoElement.appendChild(videoTitle);

        const videoPlayer = document.createElement('video');
        videoPlayer.src = video.url;
        videoPlayer.controls = false;
        videoPlayer.setAttribute('playsinline', ''); // Add playsinline attribute
        videoElement.appendChild(videoPlayer);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('buttons');
        videoElement.appendChild(buttonContainer);

        const playButton = document.createElement('button');
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        playButton.addEventListener('click', () => {
            if (!this.isPlaying) {
                const dialog = this.showVideoScreen(videoPlayer);
                videoElement.style.display = 'flex'; // Show the video element
                videoPlayer.play();
                this.isPlaying = true;
                videoPlayer.onended = () => {
                    this.hideVideoScreen(dialog);
                    this.isPlaying = false;
                    videoElement.style.display = 'flex'; // Show the video element
                    // Call the function to fetch and create random videos
                    setTimeout(() => {
                        this.startLoading(); // Start loading indicator
                        setTimeout(() => {
                            this.fetchAndCreateRandomVideos(); // Fetch and create random videos
                            setTimeout(() => {
                                this.stopLoading(); // Stop loading indicator
                            }, 2000); // Adjust loading time to 2 seconds
                        }, 6000); // Adjust loading time to 2 seconds
                    }, 6000); // Adjust loading time to 2 seconds


                };
            } else {
                const dialog = document.querySelector('dialog.overlaying');
                if (dialog) {
                    this.hideVideoScreen(dialog);
                    videoPlayer.pause();
                    playButton.innerHTML = '<i class="fas fa-plause"></i>';
                    this.isPlaying = false;
                    videoElement.style.display = 'flex'; // Show the video element
                    // Call the function to fetch and create random videos
                    this.fetchAndCreateRandomVideos();
                }
            }
        });


        buttonContainer.appendChild(playButton);

        const likeButton = document.createElement('button');
        likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        likeButton.addEventListener('click', () => {
            videoPlayer.likes++;
            likeButton.textContent = `Like (${video.likes})`;
        });
        buttonContainer.appendChild(likeButton);

        const viewButton = document.createElement('button');
        viewButton.innerHTML = '<i class="fas fa-globe"></i>';
        buttonContainer.appendChild(viewButton);

        const viewCount = document.createElement('div');
        viewCount.innerHTML = '<i class="fas fa-eye"></i>';
        viewCount.classList.add('view-count');
        viewCount.addEventListener('click', (event) => {
            const mouseX = event.clientX; // Get the mouse X-coordinate
            const mouseY = event.clientY; // Get the mouse Y-coordinate

            // Call the function to show the overlay view for this video
            this.showVideoRecordOverlay(video, mouseX, mouseY);
        });

        buttonContainer.appendChild(viewCount);
        
        videoElement.addEventListener('mouseover', function () {
            buttonContainer.style.display = 'flex';
        });

        videoElement.addEventListener('mouseout', function () {
            buttonContainer.style.display = 'none';
        });

        videoElement.addEventListener('touchstart', function () {
            buttonContainer.style.display = 'flex';
        });

        videoElement.addEventListener('touchend', function () {
            buttonContainer.style.display = 'none';
        });

        // Check if the video is not the watermark video
        const isNotWatermarkVideo = video.title !== 'Watermark Video'; // Assuming the title is unique

        if (isNotWatermarkVideo) {
            videoPlayer.addEventListener('ended', () => {
                // Call the watermarkVideo() method after the non-watermark video ends
                this.watermarkVideo();
            });
        }



        videoContainer.appendChild(videoElement);

        return videoElement;
    }
}

// Usage:
const videoPlayer = new VideoPlayer();
videoPlayer.startLoading();
window.addEventListener('load', () => videoPlayer.stopLoading());
videoPlayer.fetchAndCreateRandomVideos();

document.addEventListener('DOMContentLoaded', function() {
    const homeLink = document.querySelector('.home-link');
    homeLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
        videoPlayer.fetchAndCreateVideos();

    });
});
let isOverlayed = false;
let overlay; // Declare overlay variable outside the functions to make it accessible globally

document.addEventListener('DOMContentLoaded', function() {
    const videosLink = document.querySelector('.videos-link');

    videosLink.addEventListener('click', function(event) {
        event.preventDefault();
        if (!isOverlayed) {
            fetch('videos.json') // Adjust the path to video.json as needed
                .then(response => response.json())
                .then(data => {
                    // Now you can work with the JSON data
                    const videoData = data;
                    createOverlayAndFetchCategories(videoData);
                })
                .catch(error => console.error('Error fetching JSON data:', error));
        } else {
            removeOverlay();
            isOverlayed = false;
        }
    });
});

function createOverlayAndFetchCategories(jsonData) {
    overlay = createOverlay(); // Assign the overlay to the global variable
    document.body.appendChild(overlay);
    fetchCategories(jsonData);
    isOverlayed = true;
}

function createOverlay() {
    const overlayElement = document.createElement('div');
    overlayElement.classList.add('overlay');
    overlayElement.innerHTML = `
            <div class="category-list">
                <h3>Categories</h3>
                <ul class="categories">
                    <!-- Category items will be added here dynamically -->
                </ul>
            </div>
        `;
    return overlayElement;
}

function fetchCategories(jsonData) {
    const categories = jsonData.map(video => video.category);
    const uniqueCategories = Array.from(new Set(categories));

    const categoryList = overlay.querySelector('.categories'); // Use overlay variable to select elements
    categoryList.innerHTML = '';

    uniqueCategories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.textContent = category;
        listItem.addEventListener('click', () => {
            videoPlayer.createVideosByCategory(category);
        });
        categoryList.appendChild(listItem);
    });
}

function removeOverlay() {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

const marqueeContainer = document.querySelector('.marquee-container');

marqueeContainer.addEventListener('mouseenter', () => {
    pauseMarqueeAnimation();
});

marqueeContainer.addEventListener('mouseleave', () => {
    resumeMarqueeAnimation();
});

marqueeContainer.addEventListener('touchstart', () => {
    pauseMarqueeAnimation();
});

marqueeContainer.addEventListener('touchend', () => {
    resumeMarqueeAnimation();
});

function pauseMarqueeAnimation() {
    const marqueeText = document.querySelector('.marquee-text');
    marqueeText.style.animationPlayState = 'paused';
}

function resumeMarqueeAnimation() {
    const marqueeText = document.querySelector('.marquee-text');
    marqueeText.style.animationPlayState = 'running';
}
