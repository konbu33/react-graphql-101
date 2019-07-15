import React, { Component } from 'react'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

const StarButton = props => {
	const { node, after, before, first, last, query } = props
	const totalCount = node.stargazers.totalCount
	const viewerHasStarred = node.viewerHasStarred
	const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
	const hasStarred = viewerHasStarred === true ? "starrd" : "-"

	const StarStatus = ({addOrRemoveStar}) => {
		return (
			<button 
				onClick={
					() => addOrRemoveStar({
						variables: { input: { starrableId: node.id } },
						update: (store, { data: { addStar, removeStar } }) =>{
							const { starrable } = addStar || removeStar
							console.log(starrable)
							const data = store.readQuery({
								query: SEARCH_REPOSITORIES,
								variables: { after, before, first, last, query }
							})
							const edges = data.search.edges
							const newEdges = edges.map( edge => {
								if ( edge.node.id === node.id ) {
									const totalCount = edge.node.stargazers.totalCount
									//const diff = viewerHasStarred ? -1 : 1
									const diff = starrable.viewerHasStarred ? 1 : -1
									const newTotalCount = totalCount + diff
									edge.node.stargazers.totalCount = newTotalCount
								}
								return edge
							})
							data.search.edges = newEdges
							store.writeQuery({ query: SEARCH_REPOSITORIES, data })
						}
					})
				}
			>
				{starCount} | {hasStarred}
			</button>
		)
	}
	return (
		<Mutation 
			mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR } 
		>
			{
				addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar} />
			}
		</Mutation>
	)
}

const PER_PAGE = 5
const DEFAULT_STATE = {
	after: null,
	before: null,
	first: PER_PAGE,
	last: null,
	query: ""
}

class App extends Component {
	constructor(props) {
		super(props)
		this.state = DEFAULT_STATE

		this.myRef = React.createRef()
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleSubmit(event) {
		event.preventDefault()
		this.setState({
			query: this.myRef.current.value
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
			<form onSubmit={this.handleSubmit}>
				<input ref={this.myRef} />
				<input type="submit" value="submit" />
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
							console.log({search}) 					
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
														<StarButton node={node} {...{after, before, first, last, query}} />
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

