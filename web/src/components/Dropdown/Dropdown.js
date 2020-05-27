import React from 'react';

import Button from '../Button/Button';
import './Dropdown.css';

const dropdown = props => (
    <div className="primary-dropdown">
    {props.selectedCategory ? (
        <p className="drop">{props.selectedCategory}</p>
    ) : <p className="drop">Selecciona una categoría</p>}
    <div className="dropdown-content">
    {props.categories.map(category => (
      <Button key={category.title} mode="flat" design="danger" onClick={props.onChangeCategory.bind(this, category.title)}>{category.title}</Button>
    ))}
    </div>
    </div>
  );
  
  export default dropdown;