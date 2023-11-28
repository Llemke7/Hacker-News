"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const $story = $(`
    <li id="${story.storyId}">
      <a href="${story.url}" target="_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
      <button class="favorite-icon">Favorite</button>
    </li>
  `);

  // Add a click event listener to the favorite button/icon
  $story.find('.favorite-icon').on("click", async (event) => {
    event.preventDefault();
    try {
      await story.toggleFavorite(currentUser);
      $(event.target).text(story.isFavorite ? "Unfavorite" : "Favorite");
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  });

  return $story;
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


// submission of new story
document.getElementById('add-story-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const url = document.getElementById('new-url').value;
  
    try {
      const newStory = await storyList.addStory(currentUser, { title, author, url });
    } catch (error) {
      console.error('Error adding story:', error);
      
    }
  });

  // favorite stories

  function displayFavoriteStories() {
  const favoriteStories = currentUser.favorites;
  const $favoritesContainer = $('#favorites-container'); 
  $favoritesContainer.empty();

  favoriteStories.forEach(story => {
    const $favoriteStoryMarkup = generateFavoriteStory(story);
    $favoritesContainer.append($favoriteStoryMarkup);
  });


  $favoritesContainer.show();
}
  
function updateFavoriteStatus(storyId) {
  axios.put(`/api/stories/${storyId}/favorite`)
    .then(response => {
      console.log('Favorite status updated successfully:', response.data);
    })
    .catch(error => {
      console.error('Failed to update favorite status:', error);
    });
}

function handleFavoriteToggle(event){
  const storyId = event.target.dataset.storyId;
  if (storyId) {

    updateFavoriteStatus(storyId);
  }
}

document.addEventListener('click', function (event) {
  if (event.target.classList.contains('favorite-icon')) {
    handleFavoriteToggle(event);
  }
});
  

  function generateFavoriteStory(story) {
    const $favoriteStory = $(`
    <div class="favorite-story">
      <a href="${story.url}" target="_blank">${story.title}</a>
      <small>by ${story.author}</small>
    </div>
  `);

  return $favoriteStory;
}
  