export const CalculateFileSize = (size) => {
    let approxSize = 0;
    if (size < 1024) {
        approxSize = size + " B";
    } else if (size < 1024 * 1024) {
        approxSize = (size / 1024).toFixed(2) + " KB";
    }
    else if (size < 1024 * 1024 * 1024) {
        approxSize = (size / (1024 * 1024)).toFixed(2) + " MB";
    }
    else {
        approxSize = (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    return approxSize;
}