(function() {
    // Fall back to local scripts if the remote scripts cannot be retrieved.
    function inject(name, remoteSrc, localSrc) {
        if (name in window) {
            return;
        }

        var newScript = document.createElement('script');
        newScript.src = localSrc;

        var oldScript = document.querySelector('script[src="' + remoteSrc + '"]');
        oldScript.parentNode.insertBefore(newScript, oldScript.nextSibling);
    }

    inject('Zepto', 'https://cdnjs.cloudflare.com/ajax/libs/zepto/1.1.2/zepto.min.js', 'lib/zepto.min.js');
    inject('d3', 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.0/d3.min.js', 'lib/d3.min.js');
})();
