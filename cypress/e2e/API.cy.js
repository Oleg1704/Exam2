import { faker } from '@faker-js/faker';

describe('API Test 1', () => {
  it('should get all posts and verify status code and content type', () => {
    cy.request({
      method: 'GET',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.headers['content-type']).to.include('application/json')
      expect(response.body).to.not.be.null
      expect(response.body.length).to.be.greaterThan(0)
    })
  })
})

describe('API Test 2', () => {
  it('should get the first 10 posts and verify status code and returned posts', () => {
    cy.request({
      method: 'GET',
      url: '/posts?_start=0&_limit=10',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.headers['content-type']).to.include('application/json')
      expect(response.body).to.have.length(10)
      expect(response.body[0]).to.have.property('id', 1)
      expect(response.body[9]).to.have.property('id', 10)
    })
  })
})

describe('API Test 3', () => {
  it('should get posts with id = 55 and id = 60 and verify status code and id values', () => {
    const ids = [55, 60]
    cy.request({
      method: 'GET',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.not.be.null
      const filteredPosts = response.body.filter(post => ids.includes(post.id))
      expect(filteredPosts.length).to.eq(2)
      filteredPosts.forEach(post => {
        expect(ids).to.include(post.id)
      })
    })
  })
})

describe('API Test 4', () => {
  it('should create a post and verify the status code', () => {
    cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        title: 'New Post',
        body: 'This is a new post.',
        userId: 1
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })
})

describe('API Test 5', () => {
  let accessToken = ''

  before(() => {
    // Отримуємо токен доступу з API
    cy.request({
      method: 'POST',
      url: '/login',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'olivier@mail.com',
        password: 'bestPassw0rd'
      }
    }).then((response) => {
      accessToken = response.body.accessToken
    })
  })

  it('should create a new post and verify status code and content', () => {
    // Створюємо новий пост з використанням токена доступу
    cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: {
        title: 'New post title',
        content: 'New post content'
      }
    }).then((response) => {
      expect(response.status).to.eq(201)

      // Перевіряємо, що створений пост має правильний заголовок та вміст
      cy.request({
        method: 'GET',
        url: `/664/posts/${response.body.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.title).to.eq('New post title')
        expect(response.body.content).to.eq('New post content')
      })
    })
  })
})

describe('API Test 6', () => {
  it('should create a new post and verify that the entity is created', () => {
    const newPost = {
      title: 'New Post',
      body: 'This is a new post created through API'
    }
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: newPost
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.deep.equal({...newPost, id: response.body.id})
    })
  })
})

describe('API Test 7', () => {
  it('should return 404 when updating a non-existing entity', () => {
    const entityToUpdate = { 
      title: 'Updated Title', 
      body: 'Updated Body' 
    }

    cy.request({
      method: 'PUT',
      url: '/posts/',
      headers: {
        'Content-Type': 'application/json'
      },
      body: entityToUpdate,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })
})


describe('API Test 8', () => {
  it('should create a post and update the created post entity and verify the status code and updated post entity', () => {
    const newPost = {
      title: 'New Post',
      content: 'This is a new post'
    }

    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: newPost
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.headers['content-type']).to.include('application/json')
      expect(response.body).to.deep.include(newPost)

      const updatedPost = {
        ...newPost,
        content: 'This is an updated post'
      }

      cy.request({
        method: 'PUT',
        url: `/posts/${response.body.id}`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: updatedPost
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.headers['content-type']).to.include('application/json')
        expect(response.body).to.deep.include(updatedPost)
      })
    })
  })
})

describe('API Test 9', () => {
  it('should return a 404 error when attempting to delete a non-existing post', () => {
    cy.request({
      method: 'DELETE',
      url: '/posts/',
      headers: {
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false 
    }).then((response) => {
      expect(response.status).to.eq(404)
    })
  })
})

describe('API Test 10', () => {
  it('should create, update, and delete a post entity and verify status code and deletion', () => {
    // create a new post
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        title: 'New post title',
        content: 'New post content'
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body).to.have.property('id')
      const postId = response.body.id

      // update the post
      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          title: 'Updated post title',
          content: 'Updated post content'
        }
      }).then((response) => {
        expect(response.status).to.eq(200)

        // delete the post
        cy.request({
          method: 'DELETE',
          url: `/posts/${postId}`,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          expect(response.status).to.eq(200)

          // verify the post is deleted
          cy.request({
            method: 'GET',
            url: `/posts/${postId}`,
            headers: {
              'Content-Type': 'application/json'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(404)
          })
        })
      })
    })
  })
})