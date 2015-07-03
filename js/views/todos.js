var app = app || {};

// Todo Item View
// --------------
// The DOM element for a todo item...
app.TodoView = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#item-template').html()),

	// The DOM events specific to an item.
	events: {
		'dblclick label': 'edit',
		'keypress .edit': 'updateOnEnter',
		'blur .edit': 'close',
		'click .toggle': 'togglecompleted',
		'click .destroy': 'clear'
	},

	// The TodoView listens for changes to its model, rerendering. Since there's
 	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
 	// app, we set a direct reference on the model for convenience.
	initialize: function(){
		this.listenTo(this.model, 'change', this.render);
		//remove the view from the DOM of the current model
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'visible', this.toggleVisible);
	},

	// Rerenders the titles of the todo item.
	render: function(){
		// Backbone LocalStorage is adding `id` attribute instantly after
		// creating a model.  This causes our TodoView to render twice. Once
		// after creating a model and once on `id` change.  We want to
		// filter out the second redundant render, which is caused by this
		// `id` change.  It's known Backbone LocalStorage bug, therefore
		// we've to create a workaround.
		// https://github.com/tastejs/todomvc/issues/469
		if (this.model.changed.id !== undefined) {
			return;
		}
		//provide attributes of the model template
		this.$el.html(this.template(this.model.toJSON()));
		//this.$el is the <li></li> element of the todo item
		this.$el.toggleClass('completed', this.model.get('completed'));
		this.toggleVisible();
		//select the current input (where you could edit the title and it 
		//is hidden always except in editing mode) of the todo element
		this.$input = this.$('.edit');
		//return the view so that it can be used in other places
		//(e.g. addOne() in app.js under views folder)
		return this;
	},

	toggleVisible: function(){
		//if this.isHidden returns true, then add the class. Otherwise remove it.
		this.$el.toggleClass('hidden', this.isHidden());
	},
	//display or hide the todo item based on the current filter
	isHidden: function(){
		var isCompleted = this.model.get('completed');
		return (
			// hidden cases only
			//hide the todo element when the todo is not completed and the filter is in 'completed'
			(!isCompleted && app.TodoFilter === 'completed') || 
			//hide the todo element when the todo is  completed and the filter is in 'active'
			 (isCompleted && app.TodoFilter === 'active')
		);
	},

	togglecompleted: function(){
		this.model.toggle();
	},

	// Switch this view into `"editing"` mode, displaying the input field
	edit: function(){
		this.$el.addClass('editing');
		this.$input.focus();
	},

	// Close the `"editing"` mode, saving changes to the todo.
	close: function(){
		var value = this.$input.val().trim();
		if(value){
			this.model.save({title: value});
		}
		this.$el.removeClass('editing');
	},

	//If you hit 'enter', we're through editing the item
	updateOnEnter: function(e){
		if(e.which === ENTER_KEY){
			this.close();
		}
	},
	//Remove the item, destroy the model from
    // *localStorage* and delete its view.
	clear: function(){
		//console.log("activate destroy");
		this.model.destroy();
	}
});



























