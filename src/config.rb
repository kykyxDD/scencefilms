Encoding.default_external = "utf-8"

# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
css_dir = '../css'
sass_dir = 'scss'
images_dir = '../image'

# You can select your preferred output style here (can be overridden via the command line):
environment = :production #:production #:development
output_style = (environment == :production) ? :compressed : :expanded

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false

asset_cache_buster :none

sfx_suffix = 'ie8:ie, ie8lte:ie, print:css/print'
sfx_files = 'style_front'

# :invalid => :replace, :undef => :replace, :replace => "?"
#custom functions
module Sass::Script::Functions
  def unicode(string)
    Sass::Script::String.new(
      '"' + string.to_s()[1..-2].split(//).map{ |c|
			'\\' + c.ord.to_s(16)
		}.join + '"'
    )
  end
end
