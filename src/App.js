import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { SEARCH_REPOSITORIES } from './graphql'

const VARIABLES = {
	after: null,
	before: null,
	first: 5,
	last: null,
	query: "フロントエンドエンジニア"
}

class App extends Component {
	constructor(props) {
		super(props)

		this.state = VARIABLES
	}

	render() {
		const { after, before, first, last, query } = this.state

  	return (
			<ApolloProvider client={client}>

				<Query 
					query={SEARCH_REPOSITORIES}
					variables={ { after, before, first, last, query } }
				>
					{
						({loading, error, data}) => {
							if (loading) return 'Loading...'
							if (error) return `Error: ${error.message}`

							console.log({data})
							return <div></div>
						}
						
					}
				</Query>
			</ApolloProvider>
  	)
	}
}

export default App

