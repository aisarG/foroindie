import React, { Component, Fragment } from 'react';
import Modal from '../../Modal/Modal';
import Backdrop from '../../Backdrop/Backdrop';
import Dropdown from '../../Dropdown/Dropdown';
import Input from '../../Form/Input/Input';
import FilePicker from '../../Form/Input/FilePicker';
import Image from '../../Image/Image';
import { required, notRequired, length } from '../../../util/validators';
import { generateBase64FromImage } from '../../../util/image';

const POST_FORM = {
  title: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })]
  },
  url: {
    value: '',
    valid: true,
    touched: true,
    validators: [notRequired]
  },
  image: {
    value: '',
    valid: true,
    touched: true,
    validators: [notRequired]
  },
  content: {
    value: '',
    valid: true,
    touched: true,
    validators: [notRequired]
  },
  category: {
    value: '',
    valid: true,
    touched: true,
    validators: [required]
  }
};

class FeedEdit extends Component {
  state = {
    postForm: POST_FORM,
    formIsValid: false,
    imagePreview: null
  };
  

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.editing &&
      prevProps.editing !== this.props.editing &&
      prevProps.selectedPost !== this.props.selectedPost
    ) {
      const postForm = {
        title: {
          ...prevState.postForm.title,
          value: this.props.selectedPost.title,
          valid: true
        },
        url: {
          ...prevState.postForm.url,
          value: this.props.selectedPost.url,
          valid: true
        },
        image: {
          ...prevState.postForm.image,
          value: this.props.selectedPost.imagePath,
          valid: true
        },
        content: {
          ...prevState.postForm.content,
          value: this.props.selectedPost.content,
          valid: true
        },
        category: {
          ...prevState.postForm.category,
          value: this.props.selectedPost.category,
          valid: true
        }
      };
      this.setState({ postForm: postForm, formIsValid: true });
    }
  }

  postInputChangeHandler = (input, value, files) => {
    if (files) {
      generateBase64FromImage(files[0])
        .then(b64 => {
          this.setState({ imagePreview: b64 });
        })
        .catch(e => {
          this.setState({ imagePreview: null });
        });
    }
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.postForm[input].validators) {
            isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.postForm,
        [input]: {
          ...prevState.postForm[input],
          valid: isValid,
          value: files ? files[0] : value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        postForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => {
      return {
        postForm: {
          ...prevState.postForm,
          [input]: {
            ...prevState.postForm[input],
            touched: true
          }
        }
      };
    });
  };

  backdropCancelPostChangeHandler = () => {
    this.props.onCancelEdit();
  };

  cancelPostChangeHandler = () => {
    this.setState({
      postForm: POST_FORM,
      formIsValid: false
    });
    this.props.onCancelEdit();
  };

  acceptPostChangeHandler = () => {
    const post = {
      title: this.state.postForm.title.value,
      image: this.state.postForm.image.value,
      content: this.state.postForm.content.value,
      url: this.state.postForm.url.value,
      category: this.state.postForm.category.value
    };
    this.props.onFinishEdit(post);
    this.setState({
      postForm: POST_FORM,
      formIsValid: false,
      imagePreview: null
    });
  };

  changeCategoryHandler = (categoryTitle, event) => {
    event.preventDefault()
    this.setState(prevState => {
      return {
        postForm: {
          ...prevState.postForm, 
          category: {
            ...prevState.postForm.category, 
            value: categoryTitle
          } 
        }
      }
    })
  }

  render() {
    return this.props.editing ? (
      <Fragment>
        <Backdrop onClick={this.backdropCancelPostChangeHandler} />
        <Modal
          title="New Post"
          acceptEnabled={this.state.formIsValid}
          onBackdropCancelModal={this.backdropCancelPostChangeHandler}
          onCancelModal={this.cancelPostChangeHandler}
          onAcceptModal={this.acceptPostChangeHandler}
          isLoading={this.props.loading}
        >
          <form>
            <Input
              id="title"
              label="Title (requerido)"
              control="input"
              onChange={this.postInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'title')}
              valid={this.state.postForm['title'].valid}
              touched={this.state.postForm['title'].touched}
              value={this.state.postForm['title'].value}
            />
            <Dropdown 
            categories={this.props.categories}
            onChangeCategory={this.changeCategoryHandler}
            selectedCategory={this.state.postForm.category.value}
            />
            <Input
              id="url"
              label="Url"
              control="input"
              onChange={this.postInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'url')}
              valid={this.state.postForm['url'].valid}
              touched={this.state.postForm['url'].touched}
              value={this.state.postForm['url'].value}
            />
            <FilePicker
              id="image"
              label="Image"
              control="input"
              onChange={this.postInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'image')}
              valid={this.state.postForm['image'].valid}
              touched={this.state.postForm['image'].touched}
            />
            <div className="new-post__preview-image">
              {!this.state.imagePreview && <p>Please choose an image.</p>}
              {this.state.imagePreview && (
                <Image imageUrl={this.state.imagePreview} contain left />
              )}
            </div>
            <Input
              id="content"
              label="Content"
              control="textarea"
              rows="5"
              onChange={this.postInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'content')}
              valid={this.state.postForm['content'].valid}
              touched={this.state.postForm['content'].touched}
              value={this.state.postForm['content'].value}
            />
          </form>
        </Modal>
      </Fragment>
    ) : null;
  }
}

export default FeedEdit;
