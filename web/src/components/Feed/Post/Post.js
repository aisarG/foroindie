import React from 'react';

import Button from '../../Button/Button';
import './Post.css';
import Link from 'react-router-dom/Link';

const post = props => (
  <article className="post">
    {props.url ? (
        <h1><a href={`${props.url}`} target="_blank">{props.title}</a></h1>
    ) : <h1><Link to={`/feed/${props.id}`}>{props.title}</Link></h1>}
    <div className="post-misc">
    <p className="post-meta">
        Posted by {props.author} on {props.date}
      </p>
      <div className="post-actions">
      {props.userId === props.authorId ? (
        <Button mode="normal" onClick={props.onStartEdit}>Edit</Button>      
        ) : null}
      {props.userId === props.authorId ? (
        <Button mode="normal" onClick={props.onDelete}>Delete</Button>
        ) : null}
      </div>
      </div>
  </article>

);


export default post;
