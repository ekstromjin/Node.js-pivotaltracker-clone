"use strict";

var consts = {
    PHOTO_URL :{
    	TEMP: 'client/uploads/temp/',
    	USER: 'client/uploads/user/',
        PROJECT: 'client/uploads/project/',
        STORY: 'client/uploads/story/',
    },
    ERROR: {
    	NO_USER: 'Your email address does not exist.',
    	IN_CORRECT_PASSWORD: 'Your password is incorrect.',
    	DUPLICATE_EMAIL: 'Your email address has been already registered.',
        NOT_ACTIVATE: 'Please activate your email address.'
    },
    ROLE: {
        MEMBER: 0,
        ADMIN: 9
    },
    PROJECT: {
        ITEMS_PER_PAGE: 10
    },
    WEBSOCKET_EVENTS: {
        PIVOTAL_APP: {
            getCurrentProjects: 'pivotal_app:getcurrentprojects',
            updateCurrentProjects: 'pivotal_app:updatecurrentprojects',
            CREATE_STORY: 'pivotal_app:createStory',
            CREATE_STORY_SUCCESS: 'pivotal_app:createStorySuccess',
            CREATE_STORY_ERROR: 'pivotal_app:createStoryError',
            UPDATE_STORY: 'pivotal_app:updatestory',
            REMOVE_STORY: 'pivotal_app:removeStory',
            STORY_RATING_START: 'pivotal_app:storyRatingStart',
            CREATE_COMMENT: 'pivotal_app:createComment',
            CREATE_TASK: 'pivotal_app:createTask',
            CREATE_TASK_SUCCESS: 'pivotal_app:createTaskSuccess',
            CREATE_TASK_ERROR: 'pivotal_app:createTaskError',
            STORY: 'pivotal_app:story',
            DONE_TASK: 'pivotal_app:doneTask',
            REMOVE_TASK: 'pivotal_app:removeTask',
            GET_ALL_PROJECT: 'pivotal_app:getAllProject',
            EXPECT_CURRENT_STORY: 'pivotal_app:expectCurrentStory',
            ESTIMATE_STORY: 'pivotal_app:estimateStory'
        }
    },
};

module.exports = consts;
