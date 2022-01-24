import { useState, useContext, useEffect } from 'react';

import UserContext from '../context/UserContext';
import Alert from "../common/Alert";

import GroundScoreApi from '../api/gs-api';
// import ReactDOM from 'react-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function StaticModal({ currentSearch }) {
    const { currentUser, searches, setSearches } = useContext(UserContext);


    function isSearchSaved() {
        let saved = false;
        if (currentSearch.id !== "temp" &&
            searches.some((search) => search.id === currentSearch.id)) saved = true;

        return saved;
    }

    const [saved, setSaved] = useState(isSearchSaved());
    // let icon = saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark";


    const [show, setShow] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        userComments: ""
    });
    const [formErrors, setFormErrors] = useState([]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
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
            let newSearchList = await GroundScoreApi.getUserSearches(newSearch.username);
            setSaved(true);
            setSearches(newSearchList);
            setShow(false);
        } catch (e) {
            console.error("Did not save search: ", e)
            setFormErrors([...formErrors, "Something went wrong trying to save. Please try again"]);
        }
    }

    /** Update form data field */
    function handleChange(evt) {
        const { name, value } = evt.target;
        setFormData(data => ({ ...data, [name]: value }));
    }

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
            <br />
            <Button
                variant="warning"
                onClick={toggleUserFavorite}>
                Toggle Save Search
            </ Button>
            {/* <FontAwesomeIcon icon={icon} /> */}


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