import React, {Component, PropTypes} from 'react'
import Modal from 'react-modal'

const modalStyle = {
  overlay: {
    backgroundColor: null
  },
  content: {
    top: null,
    left: null,
    right: null,
    bottom: null,
    border: null,
    background: null,
    borderRadius: null,
    padding: null,
    position: null
  }
}

export default class MessageDialog extends Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    hideModal: PropTypes.func.isRequired
  }

  render () {
    return (
      <Modal className='Modal__Bootstrap modal-dialog' isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.hideModal} shouldCloseOnOverlayClick={false}
        style={modalStyle}>
        <div className='modal-content'>
          <div className='modal-header'>
            <button type='button' className='close' onClick={this.props.hideModal}>
              <span aria-hidden='true'>&times;</span>
            </button>
            <h4 className='modal-title'>Warning</h4>
          </div>
          <div className='modal-body'>
            <p>{this.props.message}</p>
          </div>
          <div className='modal-footer'>
            <button onClick={this.props.hideModal} type='button' className='btn btn-danger'>Close</button>
          </div>
        </div>
      </Modal>
    )
  }
}
