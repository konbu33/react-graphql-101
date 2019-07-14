import gql from 'graphql-tag'

export const ME = gql`
	query me {
	  user(login: "konbu33") {
	    login
	    avatarUrl
	  }
	}
`

export const SEARCH_REPOSITORIES = gql`
	query search( $after: String, $before: String, $first: Int, $last: Int, $query: String! ) {
	  search(after: $after, before: $before, first: $first, last: $last, query: $query, type: REPOSITORY) { 
	    repositoryCount
	    pageInfo {
	      endCursor
	      hasNextPage
	      hasPreviousPage
	      startCursor
	    }
	    edges {
	      cursor
	      node {
	        ... on Repository {
	          id
	          name
	          url
	          stargazers {
	            totalCount
	          }
	          viewerHasStarred
	        }
	      }
	    }
	  }
	}
`