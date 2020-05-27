import React from 'react';

import Button from '../Button/Button';
import './Comment.css';
// import Link from 'react-router-dom/Link';

const comment = props => (
  <article className="post">
    <div className="card w-100">
      <div className="card-body">
      <p className="post__meta">
        Posted by {props.commentAuthor}
      </p>
    <h5 className="card-title">{props.commentContent}</h5>
    {props.userId === props.commentAuthorId ? (
        <Button mode="flat" design="danger" onClick={props.onStartEdit}>Edit</Button>
    ) : null}
    {props.userId === props.commentAuthorId ? (
        <Button mode="flat" loading={props.loading} design="danger" onClick={props.onDelete}>Delete</Button>
    ) : null}
      </div>
      </div>
  </article>

);


export default comment;