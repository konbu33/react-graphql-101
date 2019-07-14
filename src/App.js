import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client'
import { SEARCH_REPOSITORIES } from './graphql'

const StarButton = props => {
	const node = props.node
	const totalCount = node.stargazers.totalCount
	const viewerHasStarred = node.viewerHasStarred
	const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
	const hasStarred = viewerHasStarred === true ? "starrd" : "-"
	return (
		<button>
			{starCount} | {hasStarred}
		</button>
	)
}

const PER_PAGE = 5
const DEFAULT_STATE = {
	after: null,
	before: null,
	first: PER_PAGE,
	last: null,
	query: "フロントエンドエンジニア"
}

class App extends Component {
	constructor(props) {
		super(props)
		this.state = DEFAULT_STATE

		this.handleChange = this.handleChange.bind(this)
	}

	handleChange(event) {
		this.setState({
			...DEFAULT_STATE,
			query: event.target.value
		})
	}

	goNext(search) {
		this.setState({
			after: search.pageInfo.endCursor,
			before: null,
			first: PER_PAGE,
			last: null
		})
	}

	goPrevious(search) {
		this.setState({
			after: null,
			before: search.pageInfo.startCursor,
			first: null,
			last: PER_PAGE
		})
	}

	render() {
		const { after, before, first, last, query } = this.state

  	return (
			<ApolloProvider client={client}>
			<form>
				<input value={query} onChange={this.handleChange} />
			</form>

				<Query 
					query={SEARCH_REPOSITORIES}
					variables={ { after, before, first, last, query } }
				>
					{
						({loading, error, data}) => {
							if (loading) return 'Loading...'
							if (error) return `Error: ${error.message}`

							const search = data.search
							const repositoryCount = search.repositoryCount
							const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
							const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
							return (
								<>
									<h2>{title}</h2>
									<ul>
										{
											search.edges.map( edge => {
												const node = edge.node
												return (
													<li key={node.id}>
														<a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
														&nbsp;
														<StarButton node={node} />
													</li>
												)
											})
										}
									</ul>
									{
										search.pageInfo.hasPreviousPage === true ?
											<button 
												onClick={this.goPrevious.bind(this, search)}
											>
												Previous
											</button>
											:
											null
									}
									{
										search.pageInfo.hasNextPage === true ?
											<button 
												onClick={this.goNext.bind(this, search)}
											>
												Next
											</button>
											:
											null
									}
								</>
							)
						}
						
					}
				</Query>
			</ApolloProvider>
  	)
	}
}

export default App

