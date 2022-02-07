import { useState, useContext, useEffect } from 'react';

import UserContext from '../context/UserContext';
import Alert from "../common/Alert";

import GroundScoreApi from '../api/gs-api';
// import ReactDOM from 'react-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import fontawesome from '@fortawesome/fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';


/** This component is for toggling the saved-state of the 
 * search under the current user */

function StaticModal({ currentSearch }) {
    const { currentUser, searches, setSearches } = useContext(UserContext);
    let icon;

    const [saved, setSaved] = useState(isSearchSaved());


    fontawesome.library.add(faBookmark);
    fontawesome.library.add(fas);
    fontawesome.library.add(far);
    const toggleIcon = () => {
        icon = saved ? ["fas", "bookmark"] : ["far", "bookmark"];
    }
    toggleIcon();


    const [show, setShow] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        userComments: ""
    });
    const [formErrors, setFormErrors] = useState([]);

    const handleClose = () => {
        setShow(false);
        setFormErrors([]);
    }
    const handleShow = () => setShow(true);

    /** Actually saves the search to the database. */
    const handleSave = async () => {
        setFormErrors([]);
        if (formData.title.length < 2) setFormErrors(["Title must be at least 2 characters"]);

        const newSearch = {
            username: currentUser.username,
            title: formData.title,
            locationId: currentSearch.locationId,
            closestOri: currentSearch.closestOri,
            userComments: formData.userComments || ""
        }

        try {
            await GroundScoreApi.saveSearch(newSearch.username, newSearch);
            setSaved(true);
            setShow(false);
        } catch (e) {
            console.error("Did not save search: ", e)
            setFormErrors([...formErrors, "Something went wrong trying to save. Please try again"]);
        }
    }

    /** Check to see if the search is already saved by the user */
    function isSearchSaved() {
        let saved = false;
        if (currentSearch.id !== "temp" &&
            searches.some((search) => search.id === currentSearch.id)) {
            saved = true;
        }
        return saved;
    }

    /** Update form data field */
    function handleChange(evt) {
        const { name, value } = evt.target;
        setFormData(data => ({ ...data, [name]: value }));
    }

    useEffect(async () => {
        try {
            let newSearchList = await GroundScoreApi.getUserSearches(currentUser.username);
            setSearches(newSearchList);
            toggleIcon();
        } catch (err) {
            console.log("Oh no, Mr. Bill!");
            console.log(err);
        }
    }, [saved]);


    /** Shows the form for saving the search, or deletes the search from user's
     *  saved searches. Does not actually save the search in case a user cancels. */
    async function toggleUserFavorite() {
        try {
            if (!saved) {
                handleShow();
            } else {
                await GroundScoreApi.deleteSearch(currentUser.username, currentSearch.id);
                setSearches(searches.filter((search) => search.id !== currentSearch.id));
                setSaved(false);
            }
        }
        catch (e) {
            console.error(`Toggle search failed: `, e);
        }

    }


    return (
        <>
            <Button
                variant="warning"
                onClick={toggleUserFavorite}>
                <FontAwesomeIcon icon={icon} />
            </ Button>
            <br />


            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Save search as...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            name="title"
                            className="form-control"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Your personal notes</label>
                        <input
                            name="userComments"
                            className="form-control"
                            value={formData.userComments}
                            onChange={handleChange}
                        />
                    </div>

                    {formErrors.length
                        ? <Alert type="danger" messages={formErrors} />
                        : null
                    }

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>Save</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default StaticModal;