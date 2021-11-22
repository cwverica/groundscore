import React, { useState } from "react";
import './SearchForm.css'

/** Search component.
 * 
 * Used by both JobList and CompanyList.
 *  Doesn't search itself, uses the passed down function 
 *  to search, triggering a refresh.
 */

function SearchForm({ searchWith }) {
    const [searchTerm, setSearchTerm] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
        searchWith(searchTerm.trim());
        setSearchTerm(searchTerm.trim());
    };

    function handleChange(e) {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="SearchForm">
            <form className="form-inline" onSubmit={handleSubmit}>
                <input
                    className="searchBox"
                    name="searchTerm"
                    placeholder="Enter search term.."
                    value={searchTerm}
                    onChange={handleChange}
                />
                <button type="submit" className="SearchSubmit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default SearchForm;
