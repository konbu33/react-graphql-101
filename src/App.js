import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import client from './client'

const ME = gql`
	query me {
	  user(login: "konbu33") {
	    login
	    avatarUrl
	  }
	}
`

class App extends Component {
	render() {
  	return (
			<ApolloProvider client={client}>
  	  	<div>Hello Graphql</div>

				<Query query={ME}>
					{
						({loading, error, data}) => {
							if (loading) return 'Loading...'
							if (error) return `Error: ${error.message}`

							return <div>{data.user.login}</div>
						}
						
					}
				</Query>
			</ApolloProvider>
  	)
	}
}

export default App

