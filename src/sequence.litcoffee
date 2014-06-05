#Includes

	_ = require 'lodash'
	async = require 'async'

	Group = require './group'

#Sequence

	class Sequence extends Group

###Constructor

		constructor: (options, factory) ->

For every child, push it and the separator (which defaults to ' ')

			@children = []
			for child in options.children
				@children.push(factory.create(child))
				@children.push(factory.create(options.separator ? ' ')) if options.separator isnt null

Remove the last separator, so that there is 1 separator between every child

			@children.pop() if options.separator isnt null

###Parse

		handleParse: (input, context, data, done) ->

Store a reference to the first and last children

			parsesActive = 0

			parseChild = (childIndex, input) =>
				parsesActive++
				@children[childIndex].parse input, context, (result) =>

					if childIndex is @children.length - 1
						data(result)
					else
						parseChild(childIndex+1, result)
				, (err) =>
					if err?
						done(err)
					else
						parsesActive--
						if parsesActive is 0
							done()

			parseChild(0, input)



	module.exports = Sequence