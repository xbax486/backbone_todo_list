var app = app || {};

// The Application
// ---------------
// Our overall **AppView** is the top-level piece of UI.
app.AppView = Backbone.View.extend({
	// Instead of generating a new element, bind to the existing skeleton of
 	// the app already present in the HTML.
	el: '#todoapp',

	// Our template for the line of statistics at the bottom of the app.
	statsTemplate: _.template($('#stats-template').html()),

	// New
 	// Delegated events for creating new items, and clearing completed ones.
 	events: {
 		'keypress #new-todo': 'createOnEnter',
 		'click #clear-completed': 'clearCompleted',
 		'click #toggle-all': 'toggleAllComplete'
 	},

 	// At initialization we bind to the relevant events on the `Todos`
 	// collection, when items are added or changed. Kick things off by
 	// loading any preexisting todos that might be saved in *localStorage*
	initialize: function(){
		//return the DOM element of the first matched element
		//which should be unique because id in DOM should be unique
		//in this case, this returns the 'toggle-all' checkbox
		this.allCheckBox = this.$('#toggle-all')[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');

		this.listenTo(app.Todos, 'add', this.addOne);
		this.listenTo(app.Todos, 'reset', this.addAll);

		//this.listenTo(app.Todos, 'changed:completed', this.filterOne);
		this.listenTo(app.Todos, 'filter', this.filterAll);
		//refresh the list after each event fires
		this.listenTo(app.Todos, 'all', this.render);

		app.Todos.fetch();
	},

	// Rerendering the app just means refreshing the statistics -- the rest
 	// of the app doesn't change.
	render: function(){
		var completed = app.Todos.completed().length;
		var remaining = app.Todos.remaining().length;

		if(app.Todos.length){
			this.$main.show();
			this.$footer.show();
			//provide attributes of the collection template
			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			this.$('#filters li a')
				.removeClass('selected')
				.filter('[href="#/' + (app.TodoFilter || '') + '"]')
				.addClass('selected');

		}
		//hide both the menu and the footer if there is no todo item in the list 
		//(either completed or active)
		else{
			this.$main.hide();
			this.$footer.hide();
		}
		this.allCheckBox.checked = !remaining;
	},

	// Add a single todo item to the list by creating a view for it, and
 	// appending its element to the `<ul>`.
	addOne: function(todo){
		var view = new app.TodoView({model: todo});
		$('#todo-list').append(view.render().el);
	},

	// Add all items in the **Todos** collection at once.
	addAll: function(){
		this.$('#todo-list').html('');
		//'this' is the context 
		app.Todos.each(this.addOne, this);
	},

	filterOne: function(todo){
		todo.trigger('visible');
	},

	filterAll: function(){
		app.Todos.each(this.filterOne, this);
	},

	// If you hit return in the main input field, create new Todo model,
 	// persisting it to localStorage.
	createOnEnter: function(event){
		/*if(event.which !== ENTER_KEY || !this.$input.val().trim()){
			return;
		}
		app.Todos.create(this.newAttributes());
		this.$input.val('');*/

		//when the user has pressed the "Enter" key and the input field is not empty
		//then save the new todo model to the server and empty the field
		if(event.which === ENTER_KEY && this.$("#new-todo").val().trim()){
			app.Todos.create(this.newAttributes());
			this.$input.val('');
		}
	},

	//generate the attributes for a new todo item
	newAttributes: function(){
		return{
			//this refers to the view
			title: this.$input.val().trim(),
			order: app.Todos.nextOrder(),
			completed: false
		};
	},

	// Clear all completed todo items, destroying their models.
	clearCompleted: function(){
		_.invoke(app.Todos.completed(), 'destroy');
		//disable 'destroy' event behaviour
		return false;
	},

	toggleAllComplete: function(){
		//check the current state of the 'toggle-all' checkbox 
		var completed = this.allCheckBox.checked;
		app.Todos.each(function(todo){
			//this invoke a change event on each model
			todo.save({
				completed: completed
			});
		});
	}
});