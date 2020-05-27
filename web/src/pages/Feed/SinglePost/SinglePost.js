import React, { Component, Fragment } from 'react';
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
// import Draft from '../../../components/draft/draft'
import Image from '../../../components/Image/Image';
import Input from '../../../components/Form/Input/Input';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import Comment from '../../../components/Comment/Comment'
import './SinglePost.css';
import errorHandler from '../../../util/error'

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    comments: [],
    comment: '',
    editComment: {},
    postCommentLoading: false,
    deleteLoading: false,
  }

  componentDidMount() {
    let statusCode;
    this.setState({ image: 'http://localhost:8080/undefined' })
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/feed/post/' + postId)
      .then(res => {
        statusCode = res.status;
        return res.json();
      })
      .then(resData => {
        errorHandler(statusCode, resData)
        this.setState({
          title: resData.post.title,
          author: resData.post.userId.name,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
          content: resData.post.content,
        });
        return this.loadComments()
      })
      .catch(err => {
        console.log(err);
      });
  }

  loadComments = () =>{
    let statusCode;
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/comments/' + postId)
      .then(res => {
        statusCode = res.status
        return res.json();
      })
      .then(resData => {
        errorHandler(statusCode, resData)
        this.setState({
          comments: resData.comments
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  commentChangeHandler = event => {
    this.setState({comment: event.target.value})
  }

  editCommentChangeHandler = event => {
    this.setState({ editComment: {
      _id: this.state.editComment._id,
      content: event.target.value} })
  }

  postCommentHandler = event => {
    let statusCode;
    event.preventDefault()
    this.setState({
      postCommentLoading: true
    })
    const postId = this.props.match.params.postId;

    fetch('http://localhost:8080/comments/' + postId, {
      method: 'POST',
      body: JSON.stringify({
        comment: this.state.comment
      }),
      headers: {
        'Content-Type': 'application/json',
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
          const updatedComments = [...prevState.comments]
          updatedComments.push(resData)
          return {
            postCommentLoading: false,
            comments: updatedComments,
            comment: ''
          };
        });
      })
      .catch(err => {
        console.log(err)
      })
  }


  startEditCommentHandler = commentId => {
    let statusCode;
    this.setState({ isEditing: true })
    fetch('http://localhost:8080/comment/' + commentId)
    .then(res => {
      statusCode = res.status
      return res.json();
    })
    .then(resData => {
      errorHandler(statusCode, resData)
      this.setState({
        editComment: {
          _id: resData.comment._id,
          content: resData.comment.content
        },
        isEditing: true
      })
    })
  }


  postEditedCommentHandler = event => {
    this.setState({ isEditing: false })
    let statusCode;
    event.preventDefault()
    fetch('http://localhost:8080/comment/' + this.state.editComment._id, {
      method: 'PUT',
      body: JSON.stringify({
        content: this.state.editComment.content
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.props.token
      }
    })
    .then(res => {
      statusCode = res.status
      return res.json();
    })
    .then(resData => {
      console.log(resData)
      errorHandler(statusCode, resData)
      this.setState(prevState => {
        let comments = [...prevState.comments];
        const commentIndex = comments.findIndex(c => c._id === resData._id)
        comments[commentIndex] = resData
        return {
          comments: comments,
          isEditing: false 
        }
      })
      console.log(this.state.comments)
    })
  }

  cancelCommentEdit = () => {
    this.setState({ isEditing: false, editComment: {} })
  }

  deleteCommentHandler = commentId => {
    this.setState({
      deleteLoading: true
    })
    let statusCode;
    fetch('http://localhost:8080/comment/' + commentId, {
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
        this.setState(prevState => {
          let comments = [...prevState.comments];
          const updatedComments = comments.filter(c => c._id !== resData._id)
          return {
            comments: updatedComments,
            deleteLoading: false
          }
        })
      }).catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <Fragment>
      {this.state.isEditing ? (
        <Modal
        acceptEnabled={this.state.isEditing}
        onAcceptModal={this.postEditedCommentHandler}
        onCancelModal={this.cancelCommentEdit}
        >
        <form>
        <Input
            id='comment'
            label='Edit a comment'
            control='textareaComment'
            rows='5'
            onChange={this.editCommentChangeHandler}
            value={this.state.editComment.content}
            />
        </form>
        </Modal>
      ): null }
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        {this.state.image !== 'http://localhost:8080/undefined' ? (
          <div className="single-post__image">
             <Image contain imageUrl={this.state.image} />
          </div>
        ) : null }
        <p>{this.state.content}</p>
        {this.props.userId && this.props.token && (        
        <form>
            <Input
            id='comment'
            label='Post a comment'
            control='textareaComment'
            rows='5'
            onChange={this.commentChangeHandler}
            value={this.state.comment}
            />
          <Button mode="falt" loading={this.state.postCommentLoading} onClick={this.postCommentHandler}>
            Comment
          </Button>
          </form>
          )}
        {this.state.comments.map(comment => (
          <Comment 
          key={comment._id}
          id={comment._id}
          commentAuthorId={comment.userId._id}
          commentAuthor={comment.userId.name}
          commentContent={comment.content}
          userId={this.props.userId}
          loading={this.state.deleteLoading}
          onStartEdit={this.startEditCommentHandler.bind(this, comment._id)}
          onDelete={this.deleteCommentHandler.bind(this, comment._id)}
          />
        ))}

      </section>
      </Fragment>
    );
  }
}

export default SinglePost;
