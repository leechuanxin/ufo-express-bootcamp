import express from 'express';
import methodOverride from 'method-override';
import * as routes from './routes.js';

const app = express();
const PORT = process.argv[2];

// Set view engine
app.set('view engine', 'ejs');
// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));
// To receive POST request body data in request.body
app.use(express.urlencoded({ extended: false }));

app.get('/', routes.handleIndex);
app.get('/sighting', routes.handleNewSighting);
app.get('/shapes', routes.handleShapes);
app.get('/shapes/:shape', routes.handleShape);
app.get('/sighting/:index', routes.handleSighting);
app.get('/sighting/:index/edit', routes.handleSightingEdit);
app.put('/sighting/:index/edit', routes.handleSightingEditPut);
app.delete('/sighting/:index/delete', routes.handleSightingDelete);
app.post('/sighting', routes.handleSightingCreate);
app.listen(PORT);
