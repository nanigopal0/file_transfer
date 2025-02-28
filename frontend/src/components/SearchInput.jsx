import {useState} from "react";
import {CiSearch} from "react-icons/ci";


function SearchInput({onSearch}) {

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchClick = () => {
        // Handle search action

        if (onSearch) {
            onSearch(searchTerm);
        }

    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className='relative w-full  px-2 border border-gray-600 rounded-lg text-lg'>
            <input
                type="text"
                className="w-full flex-grow p-2 font-mono outline-none pr-10"
                placeholder="Search receiver"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
            />
            <CiSearch
                onClick={handleSearchClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                size={24}
            />
        </div>
    );
}

export default SearchInput;