const { serve } = require('beta-bhere-development/server/main.js');

const app = serve({ dirname: __dirname, baseHref: '/b-here-master/' });
