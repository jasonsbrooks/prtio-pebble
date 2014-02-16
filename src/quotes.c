#include <pebble.h>


static Window *window;
static TextLayer *title_layer;
static TextLayer *song_layer;
static TextLayer *artist_layer;

static BitmapLayer *check_layer;
static GBitmap *check_bitmap = NULL;
static BitmapLayer *veto_layer;
static GBitmap *veto_bitmap = NULL;


static char song[50];
static char artist[50];


enum {
  QUOTE_KEY_SONG = 0x0,
  QUOTE_KEY_ARTIST = 0x1,
  QUOTE_KEY_FETCH = 0x2,
};

static const uint32_t APPROVE_ICONS[] = {
  RESOURCE_ID_IMAGE_CHECK, //0
  RESOURCE_ID_IMAGE_VETO, //1
};


static void topButtonPressed(void) {
  Tuplet fetch_tuple = TupletInteger(QUOTE_KEY_FETCH, 2);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }
  
  dict_write_tuplet(iter, &fetch_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}
static void botButtonPressed(void) {
  Tuplet fetch_tuple = TupletInteger(QUOTE_KEY_FETCH, 3);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }
  
  dict_write_tuplet(iter, &fetch_tuple);
  dict_write_end(iter);

  app_message_outbox_send();
}


static void fetch_msg(void) {
  Tuplet fetch_tuple = TupletInteger(QUOTE_KEY_FETCH, 1);
  Tuplet song_tuple = TupletInteger(QUOTE_KEY_SONG, 1);
  Tuplet artist_tuple = TupletInteger(QUOTE_KEY_ARTIST, 1);


  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }
  
  dict_write_tuplet(iter, &fetch_tuple);
  dict_write_tuplet(iter, &song_tuple);
  dict_write_tuplet(iter, &artist_tuple);

  dict_write_end(iter);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  // refresh
  text_layer_set_text(song_layer, "Loading...");
  text_layer_set_text(artist_layer, "");

  fetch_msg();
}

static void select_long_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(song_layer, "Loading...");
  text_layer_set_text(artist_layer, "");

  fetch_msg();
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  // refresh
  topButtonPressed();
}
static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  // refresh
  botButtonPressed();
}


static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_long_click_subscribe(BUTTON_ID_SELECT, 0, select_long_click_handler, NULL);

  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);


}

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *song_tuple = dict_find(iter, QUOTE_KEY_SONG);
  Tuple *artist_tuple = dict_find(iter, QUOTE_KEY_ARTIST);

  if (song_tuple) {
    strncpy(song, song_tuple->value->cstring, 50);
    text_layer_set_text(song_layer, song);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Song tuple! %s", artist);

  }
  if (artist_tuple) {
    strncpy(artist, artist_tuple->value->cstring, 50);
    text_layer_set_text(artist_layer, artist);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Artist tuple! %s", artist);


  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped! %d", reason);
  if (reason == APP_MSG_CALLBACK_NOT_REGISTERED)
      APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Callback not registered!");
  else if (reason == APP_MSG_BUSY)
      APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Busy!");


}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}

static void app_message_init(void) {
  // Register message handlers
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);
  // Init buffers
  app_message_open(64, 64);
  fetch_msg();
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);


//Load bitmaps into GBitmap structures
//The ID you chose when uploading is prefixed with 'RESOURCE_ID_'
check_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_CHECK);
 
//Create BitmapLayers to show GBitmaps and add to Window
check_layer = bitmap_layer_create(GRect(bounds.size.w - 18, 10, 18, 20));
bitmap_layer_set_bitmap(check_layer, check_bitmap);
layer_add_child(window_layer, bitmap_layer_get_layer(check_layer));
 

//Load bitmaps into GBitmap structures
//The ID you chose when uploading is prefixed with 'RESOURCE_ID_'
veto_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_VETO);
 
//Create BitmapLayers to show GBitmaps and add to Window
//Sample images are 144 x 50 pixels
veto_layer = bitmap_layer_create(GRect(bounds.size.w - 18, bounds.size.h - 30, 18, 20));
bitmap_layer_set_bitmap(veto_layer, veto_bitmap);
layer_add_child(window_layer, bitmap_layer_get_layer(veto_layer));



  title_layer = text_layer_create(
      (GRect) { .origin = { 0, 0 }, .size = { bounds.size.w, 20 } });
  text_layer_set_text(title_layer, "Prtio"); 
  text_layer_set_background_color (title_layer, GColorClear);
  text_layer_set_text_alignment(title_layer, GTextAlignmentCenter); 
  text_layer_set_font(title_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(title_layer));

    artist_layer = text_layer_create(
      (GRect) { .origin = { 0, 45 }, .size = { bounds.size.w, 35 } });
  text_layer_set_text(artist_layer, "No artist");
  text_layer_set_text_alignment(artist_layer, GTextAlignmentCenter);
  text_layer_set_overflow_mode(artist_layer, GTextOverflowModeWordWrap);
    text_layer_set_background_color (artist_layer, GColorClear);


  text_layer_set_font(artist_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18));
  layer_add_child(window_layer, text_layer_get_layer(artist_layer));

  song_layer = text_layer_create(
      (GRect) { .origin = { 0, 70 }, .size = { bounds.size.w, bounds.size.h - 45 } });
  text_layer_set_text(song_layer, "No Songs");
  text_layer_set_text_alignment(song_layer, GTextAlignmentCenter);
    text_layer_set_background_color (song_layer, GColorClear);

  text_layer_set_overflow_mode(song_layer, GTextOverflowModeWordWrap);
  text_layer_set_font(song_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(song_layer));



  fetch_msg();
}

static void window_unload(Window *window) {
  text_layer_destroy(title_layer);
  text_layer_destroy(song_layer);
    text_layer_destroy(artist_layer);

     if (check_bitmap) {
    gbitmap_destroy(check_bitmap);
  }
      if (veto_bitmap) {
    gbitmap_destroy(veto_bitmap);
  }
  bitmap_layer_destroy(check_layer);
  bitmap_layer_destroy(veto_layer);


}

static void init(void) {
  window = window_create();
  app_message_init();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
