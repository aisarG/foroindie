import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import Error from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';
import errorHandler from '../../util/error';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    categories: [],
    totalPosts: 0,
    editPost: null,
    itemsPerPage: 8,
    postPage: 1,
    postsLoading: false,
    editLoading: false
  };

  componentDidMount() {
    this.loadPosts();
    this.loadCategories();
    const socket = openSocket('http://localhost:8080');
    socket.on('posts', data => {
      if (data.action === 'create') {
        this.addPost(data.post);
      } else if (data.action === 'update') {
        this.updatePost(data.post);
      } else if (data.action === 'delete') {
        this.loadPosts()
      }
    })
  }

  addPost = post => { 
    this.setState(prevState => {
    const updatedPosts = [...prevState.posts];
    if (prevState.postPage === 1) {
      if (prevState.posts.length >= 8) {
        updatedPosts.pop();
      }
      updatedPosts.unshift(post);
    }
    return {
      posts: updatedPosts,
      totalPosts: prevState.totalPosts + 1,
    };
  })
  }

  updatePost = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      const updatedPostIndex = updatedPosts.findIndex(p => p._id === post._id);
      if (updatedPostIndex > -1) {
        updatedPosts[updatedPostIndex] = post;
      }
      return {
        posts: updatedPosts
      };
    });
  };

  loadPosts = direction => {
    let categorySlug;
    if (this.props.category) {
      categorySlug = this.props.match.params.categorySlug;
    } else {
      categorySlug = '';
    }
    let statusCode;
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage:  page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
      fetch(`http://localhost:8080/feed/posts/${categorySlug}?page=` + page)
      .then(res => {
        statusCode = res.status
        return res.json();
      })
      .then(resData => {
        errorHandler(statusCode, resData)
        this.setState({
          posts: resData.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageUrl
            }
          }),
          totalPosts: resData.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  loadCategories = () => {
    let statusCode;
    fetch('http://localhost:8080/category')
    .then(res => {
      statusCode = res.status
      return res.json()
    })
    .then(resData => {
      errorHandler(statusCode, resData)
      this.setState({ 
        categories: resData
       })
    })
    .catch(err => {
      console.log(err)
    })
  }

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  // startEditPostHandler = postId => {
  //   this.setState(prevState => {
  //     const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

  //     return {
  //       isEditing: true,
  //       editPost: {
  //         _id: loadedPost._id, 
  //         title: loadedPost.title, 
  //         content: loadedPost.content}
  //     };
  //   });
  // };

  startEditPostHandler = postId => {
    let statusCode;
    fetch('http://localhost:8080/feed/post/' + postId)
    .then(res => {
      statusCode = res.status
      return res.json();
    })
    .then(resData => {
      errorHandler(statusCode, resData)
      this.setState({
        isEditing: true,
        editPost: {
          _id: resData.post._id, 
          title: resData.post.title,
          content: resData.post.content,
          category: resData.post.category,
          url: resData.post.url}
      });
    })
    .catch(err => {
      console.log(err);
    });
    };


  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    let statusCode;
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('image', postData.image);
    formData.append('url', postData.url);
    formData.append('category', postData.category);
    let url = 'http://localhost:8080/feed/posts';
    let method = 'POST';
    if (this.state.editPost) {
      url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
      method = 'PUT';
    }

    fetch(url, {
      method: method,
      body: formData,
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        statusCode = res.status
        return res.json();
      })
      .then(resData => {
        errorHandler(statusCode, resData)
        this.setState(prevState => {
          return {
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  deletePostHandler = postId => {
    let statusCode;
    this.setState({ postsLoading: true });
    fetch('http://localhost:8080/feed/post/' + postId, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        statusCode = res.status
        return res.json();
      })
      .then(resData => {
        errorHandler(statusCode, resData)
        this.loadPosts()
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <Error error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
          categories={this.state.categories}
        />
        <section className="feed__control">
        <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          <div className="wrapper">
          <div className="posts">
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {this.state.posts.map(post => (
            <Post
              key={post._id}
              id={post._id}
              userId={this.props.userId}
              authorId={post.userId._id}
              author={post.userId.name}
              date={new Date(post.createdAt).toLocaleDateString('en-US')}
              title={post.title}
              url={post.url}
              image={post.imageUrl}
              content={post.content}
              onStartEdit={this.startEditPostHandler.bind(this, post._id)}
              onDelete={this.deletePostHandler.bind(this, post._id)}
            />
          ))}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
              totalPosts={this.state.totalPosts}
              itemsPerPage={this.state.itemsPerPage}
              postPage={this.state.postPage}
            >
            </Paginator>
          )}
          </div>
          <div className="categories">
            <p>sdsdsdsdsdds dodsoijisdj  dsidsj isdji j sidj isd</p>
        </div>
        </div>
      </Fragment>
    );
  }
}

export default Feed;
