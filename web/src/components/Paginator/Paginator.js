import React from 'react';

import './Paginator.css';

const paginator = props => (
  <div className="paginator">
    {props.children}
    <div className="paginator__controls">
      {props.currentPage > 1 && (
        <button className="paginator__control" onClick={props.onPrevious}>
          Previous
        </button>
      )}
      {(props.itemsPerPage * props.postPage) < props.totalPosts && (
        <button className="paginator__control" onClick={props.onNext}>
          Next
        </button>
      )}
    </div>
  </div>
);

export default paginator;
