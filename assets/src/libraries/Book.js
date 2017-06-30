import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import BookDetail from './BookDetail';

// FIXME
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

export default class Book extends Component {
	constructor(props) {
		super(props);
		this.state = {
			zDepth: 1,
			available: props.book.isAvailable(),
			borrowedByMe: props.book.belongsToUser(),
			open: false
		};

		this.onMouseOver = this.onMouseOver.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this._actionButtons = this._actionButtons.bind(this);
		this._borrow = this._borrow.bind(this);
		this._return = this._return.bind(this);
		this.changeOpenStatus = this.changeOpenStatus.bind(this);
	}

	onMouseOver() { return this.setState({ zDepth: 2 }); }
	onMouseOut() { this.setState({ zDepth: 1 }); }

	_borrow() {
		this.props.service.borrowBook(this.props.book).then(() => {
			this.setState({ available: false, borrowedByMe: true });
			window.ga('send', 'event', 'Borrow', this.props.book.title, this.props.library);
		});
	}

	_return() {
		this.props.service.returnBook(this.props.book).then(() => {
			this.setState({ available: true, borrowedByMe: false });
			window.ga('send', 'event', 'Return', this.props.book.title, this.props.library);
		});
	}

	_actionButtons() {
		if (this.state.available) {
			return <RaisedButton label="Borrow" className="btn-borrow" onTouchTap={this._borrow} />;
		} else if (this.state.borrowedByMe) {
			return <RaisedButton label="Return" className="btn-return" onTouchTap={this._return} />;
		}

		return null;
	}

	changeOpenStatus() { 		
		this.setState({ open: !this.state.open }, this._trackAnalytics);					
	}

	_trackAnalytics() {
		if(this.state.open) {														
			window.ga('send', 'event', 'Show Detail', this.props.book.title, this.props.library);
		}
	}

	render() {
		const book = this.props.book;
		let contentDetail;

		if (this.state.open) {
			contentDetail = <BookDetail open={this.state.open} book={book} changeOpenStatus={this.changeOpenStatus} actionButtons={this._actionButtons} />
		}
		
		const bookCover ={
			backgroundImage: `url('${book.image_url}')`
		};

		return (		
			<Paper className="book" zDepth={this.state.zDepth} onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}>
				<div className="book-info" onClick={this.changeOpenStatus}>

					<div className="book-cover" style={bookCover}>
						<div className="book-cover-overlay"></div>
					</div>

					<div className="book-details"> 
						<h1 className="book-title">{book.title}</h1>
						<h2 className="book-author">{book.author}</h2>
					</div>
				</div>

				<div className="book-actions">
					{this._actionButtons()}
				</div>
				{contentDetail}
			</Paper>
		);
	}
}
