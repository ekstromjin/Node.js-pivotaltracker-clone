var consts = {
	api: {
		version: 'v1',
	},
	project: {
		per_page: 10,
	},
	photo_url: {
		project: '/uploads/project/',
		user: '/uploads/user/'
	},
	admin: {
		role: 9
	},
	WEBSOCKET_EVENTS: {
		PIVOTAL_APP: {
			UPDATE_CURRENT_PROJECT: 'pivotal_app:updatecurrentprojects',
			GET_PROJECT: 'pivotal_app:getProject',
			GET_CURRENT_PROJECTS: 'pivotal_app:getcurrentprojects',
            STORY: 'pivotal_app:story',
            CREATE_STORY_SUCCESS: 'pivotal_app:createStorySuccess',
            CREATE_STORY_ERROR: 'pivotal_app:createStoryError',
            UPDATE_STORY: 'pivotal_app:updatestory',
            REMOVE_STORY: 'pivotal_app:removeStory',
            STORY_RATING_START: 'pivotal_app:storyRatingStart',
            CREATE_COMMENT: 'pivotal_app:createComment',
            CREATE_TASK: 'pivotal_app:createTask',
            DONE_TASK: 'pivotal_app:doneTask',
            REMOVE_TASK: 'pivotal_app:removeTask',
            GET_ALL_PROJECT: 'pivotal_app:getAllProject',
            EXPECT_CURRENT_STORY: 'pivotal_app:expectCurrentStory',
            ESTIMATE_STORY: 'pivotal_app:estimateStory'
        }
	}
};
