import React from 'react';

export const ShareModal = ({ data }) => {
    const copyFunc = (data) => {
        navigator.clipboard.writeText(data.action.share);
        alert("Copied")
    }
    return (
        <div className='share-modal'>
            <a>Share this Refill spot</a>
            <div className='share-link'>{data.title}</div>
            <div>{data.action.share ? data.action.share : "No Link, feel free to add one!"}</div>
            <button className='copy-button' onClick={copyFunc(data)}>Copy</button>
        </div>
    )
}