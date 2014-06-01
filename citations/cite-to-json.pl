#!/usr/bin/perl -w

# my $A = 1.410511694993278;
# my $E = -1.410673785512002;
# my $C = -9499432.428873540800000;
# my $F = 4172005.746649601500000;

my $LON1=-85.333128;
my $LON2=-85.250645;
my $LAT1=35.059071;
my $LAT2=35.009647;


while (<>) {
  chomp;
  ($id, $reason, $lat, $lon, $date) = split /\t/;
  $lat =~ s/\"//g;
  $lon =~ s/\"//g;
  $date =~ s/\"//g;
  $reason =~ s/\s*\"//g;

  # $lat_m = $lat - 35.059071;
  # $lon_m = $lon - -85.33128;
  # my $px = ($lat_m-$C)/$A;
  # my $py = ($lon_m-$F)/$E;

  my $px = ($lon - $LON1)/($LON2-$LON1)*6769;
  my $py = ($LAT1 - $lat)/($LAT1-$LAT2)*4809;

  next if $px < 0 or $py < 0 or $px > 6769 or $py > 4809;

  print "{\"date\": $date, \"px\": $px, \"py\": $py, \"reason\":\"$reason\"},\n";
 
}


  
