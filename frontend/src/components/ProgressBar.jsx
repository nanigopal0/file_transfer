
const ProgressBar = ({progress}) => {
    return (
        <div className='flex'>
            <div className="w-full bg-gray-300 rounded-full h-6">
                <div
                    className="bg-green-600 h-6 rounded-full"
                    style={{width: `${progress}%`}}
                ></div>
            </div>
            <p className='ml-5 font-mono'>{progress}%</p>
        </div>
    );
};

export default ProgressBar;
