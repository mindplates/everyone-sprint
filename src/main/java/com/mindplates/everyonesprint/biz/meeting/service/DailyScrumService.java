package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import com.mindplates.everyonesprint.common.vo.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Transactional
public class DailyScrumService {

    @Autowired
    ParticipantRepository participantRepository;

    @Autowired
    MeetingService meetingService;


    public void save(Participant walker) {
        participantRepository.save(walker);
    }

    public Iterable<Participant> findAll() {
        return participantRepository.findAll();
    }

    public Iterable<Participant> findAll(Participant participant) {
        return participantRepository.findAll(Example.of(participant));
    }

    public Participant findById(Long id) {
        return participantRepository.findById(String.valueOf(id)).orElse(null);
    }

    public void deleteById(String id) {
        participantRepository.deleteById(id);
    }

    public List<Participant> startDailyScrum(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> sortedList = new ArrayList<>();

        for (Participant user : users) {
            double randomValue = Math.random();
            int order = (int) (randomValue * Integer.MAX_VALUE);
            user.setDailyScrumOrder(order);
            sortedList.add(user);
        }


        Collections.sort(sortedList);

        int counter = 0;
        for (Participant user : sortedList) {
            if (user.getConnected() != null && user.getConnected()) {
                user.setDailyScrumOrder(counter);
                if (counter == 0) {
                    user.setIsCurrentSpeaker(true);
                }
                counter++;
            } else {
                user.setDailyScrumOrder(null);
            }

            participantRepository.save(user);
        }

        meeting.setCurrentMaxOrder(counter);
        meeting.setDailyScrumStarted(true);
        meetingService.updateMeetingInfo(meeting, userSession);

        return sortedList;
    }

    public List<Participant> doneDailyScrum(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> sortedList = StreamSupport.stream(users.spliterator(), false).sorted().collect(Collectors.toList());

        for (int i = 0; i < sortedList.size(); i++) {
            Participant participant = sortedList.get(i);
            if (userSession.getId().toString().equals(participant.getId())) {
                participant.setIsDailyScrumDone(true);
                participant.setIsCurrentSpeaker(false);
                participantRepository.save(participant);

                for (int j = i + 1; j < sortedList.size(); j++) {
                    Participant nextParticipant = sortedList.get(j);
                    if (nextParticipant.getConnected() != null && nextParticipant.getConnected() && nextParticipant.getIsDailyScrumDone() != null && !nextParticipant.getIsDailyScrumDone()) {
                        nextParticipant.setIsCurrentSpeaker(true);
                        participantRepository.save(nextParticipant);
                        break;
                    }
                }

                break;
            }
        }

        if (sortedList.stream().noneMatch((participant -> participant.getIsCurrentSpeaker()))) {
            meeting.setDailyScrumStarted(false);
            meetingService.updateMeetingInfo(meeting, userSession);
        }

        return sortedList;
    }

    public List<Participant> stopDailyScrum(Meeting meeting, UserSession userSession) {
        List<Participant> sortedList = new ArrayList<>();
        meeting.setDailyScrumStarted(false);
        meetingService.updateMeetingInfo(meeting, userSession);

        return sortedList;
    }

    public List<Participant> selectDailyScrum(Meeting meeting) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));
        List<Participant> sortedList = new ArrayList<>();

        for (Participant user : users) {
            sortedList.add(user);
        }

        Collections.sort(sortedList);

        return sortedList;
    }

    public List<Participant> addDailyScrumUser(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> sortedList = new ArrayList<>();

        for (Participant user : users) {
            sortedList.add(user);
            if (meeting.getDailyScrumStarted() != null && meeting.getDailyScrumStarted()) {
                if (!user.getIsDailyScrumDone() && user.getDailyScrumOrder() == null && userSession.getId().toString().equals(user.getId())) {
                    user.setDailyScrumOrder(meeting.getCurrentMaxOrder());
                    if (StreamSupport.stream(users.spliterator(), false).noneMatch((participant -> participant.getIsCurrentSpeaker() != null && participant.getIsCurrentSpeaker()))) {
                        user.setIsCurrentSpeaker(true);
                    }
                    participantRepository.save(user);
                    meeting.setCurrentMaxOrder(meeting.getCurrentMaxOrder() + 1);
                    meetingService.updateMeetingInfo(meeting, userSession);
                }
            }
        }

        Collections.sort(sortedList);

        return sortedList;
    }


}
