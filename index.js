const { serve } = require('beta-bhere/server/main.js');

const app = serve({ dirname: __dirname, baseHref: '/b-here-demo/' });
