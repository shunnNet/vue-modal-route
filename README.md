# vue-modal-route
`vue-modal-route` is a package that manages modals using routes. 

By leveraging `vue-router`, it opens or closes modals when navigating to or from specific paths in a web application. Additionally, it allows for the transmission of complex data beyond just route parameters.

> [!WARNING] This package is still in development and is not yet ready for production use. But you can clone the repository and test it out for yourself.

## Motivation
When I'm using a mobile web page, I often instinctively press the back button or the < button to close a modal, but instead of closing the modal, it navigates away from the entire page. This behavior doesn't meet user expectations. That's why I want to integrate modals with routes. If opening a modal is tied to opening a path, then going back would simply close the modal.

Moreover, there are other scenarios where this solution is particularly useful. For instance, if you want to open a modal across different pages, you might currently use a query string and detect it when a component on the other page is mounted to trigger the modal. While this approach works, it doesn't allow for the direct transmission of complex data. 

Another example is implementing a multi-step process within a modal, such as a login or registration flow. Since these modals are usually global, using `router-view` to implement such a flow is not possible. 

By binding modals to routes, not only does it simplify handling the aforementioned scenarios, but it also reduces the complexity of managing modal states. More importantly, it enhances the user experience (UX) of modals.

## Development

```bash
# Clone the repository
git clone git@github.com:shunnNet/vrm.git

# install
pnpm install

# run
pnpm dev
```

Open `http://localhost:5173` in your browser. You can find some links and buttons to test the package.

## License
MIT

