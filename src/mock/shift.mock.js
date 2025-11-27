const shifts = [
  {
    shift_name: "Day Shift",
    start_time: "09:00:00",
    end_time: "18:00:00",
    lunch_time: 60,
    daily_working_hours: 8,
    number_of_working_days: 5,
    half_day_working: "N",
    weekoff_days: "Saturday,Sunday",
    is_active: "Y",
    log_inst: 1,
  },
  {
    shift_name: "Night Shift",
    start_time: "18:00:00",
    end_time: "02:00:00",
    lunch_time: 60,
    daily_working_hours: 8,
    number_of_working_days: 5,
    half_day_working: "N",
    weekoff_days: "Saturday,Sunday",
    is_active: "Y",
    log_inst: 1,
  },
];

module.exports = shifts;
